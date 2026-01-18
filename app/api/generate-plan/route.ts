// API route for generating upskill plan with AI, caching, rate limiting, and fallback

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { validateInputs } from '@/lib/validation';
import { UpskillPlan, UpskillInputs } from '@/lib/types';
import { generatePlanWithAI } from '@/lib/ai/generatePlanWithAI';

export const runtime = 'nodejs';

// ============================================================================
// Rate Limiting: 30 requests per minute per IP
// ============================================================================
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // requests per minute

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; resetInSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, resetInSeconds };
  }

  entry.count++;
  return { allowed: true };
}

// ============================================================================
// Caching: 24-hour TTL keyed by input hash
// ============================================================================
interface CacheEntry {
  plan: UpskillPlan;
  createdAt: number;
}

const planCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function hashInputs(inputs: UpskillInputs): string {
  // Create a normalized JSON representation for consistent hashing
  const normalized = {
    fullName: inputs.fullName.toLowerCase().trim(),
    currentRole: inputs.currentRole.toLowerCase().trim(),
    yearsExperience: inputs.yearsExperience,
    currentSkills: [...inputs.currentSkills].sort(),
    targetGoal: inputs.targetGoal,
    weeklyHours: inputs.weeklyHours,
    commuteMinutesPerDay: inputs.commuteMinutesPerDay,
    preferredStudyTime: inputs.preferredStudyTime,
    lowEnergyAfter: inputs.lowEnergyAfter,
    weekendAvailability: inputs.weekendAvailability,
  };

  return createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex');
}

function getCachedPlan(hash: string): UpskillPlan | null {
  const entry = planCache.get(hash);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.createdAt > CACHE_TTL_MS) {
    planCache.delete(hash);
    return null;
  }

  return entry.plan;
}

function cachePlan(hash: string, plan: UpskillPlan): void {
  planCache.set(hash, { plan, createdAt: Date.now() });
}

// ============================================================================
// Fallback: Deterministic plan generation if AI fails
// ============================================================================
function generateDeterministicPlan(inputs: UpskillInputs): UpskillPlan {
  const skills = inputs.currentSkills.length > 0
    ? inputs.currentSkills
    : ['Java', 'Spring Boot', 'SQL', 'REST APIs'];

  let timeSlot = '7:00 PM';
  if (inputs.preferredStudyTime === 'Morning') {
    timeSlot = '6:30 AM';
  } else if (inputs.preferredStudyTime === 'Evening') {
    if (inputs.lowEnergyAfter === '6 PM') {
      timeSlot = '5:30 PM';
    } else {
      timeSlot = '7:00 PM';
    }
  } else if (inputs.preferredStudyTime === 'Flexible') {
    timeSlot = '1:00 PM';
  }

  const needsCommuteTasks = inputs.commuteMinutesPerDay >= 60;

  let weekdayDuration = 30;
  let weekendDuration = 90;
  if (inputs.weeklyHours <= 3) {
    weekdayDuration = 25;
    weekendDuration = 60;
  } else {
    weekdayDuration = 40;
    weekendDuration = 90;
  }

  const weeklySchedule = generateWeeklySchedule(
    inputs.weeklyHours,
    timeSlot,
    weekdayDuration,
    weekendDuration,
    needsCommuteTasks
  );

  const prioritizedSkills = generatePrioritizedSkills(inputs.targetGoal, skills);
  const weekPlan = generate12WeekPlan(inputs.targetGoal);
  const burnoutTips = generateBurnoutTips(inputs.weeklyHours);

  const nextActions = [
    {
      title: 'Register for Free Live Class',
      description: 'Join our expert-led session on AI fundamentals and career transitions. Learn industry insights and get your questions answered live.',
    },
    {
      title: 'Book Career Consultation Call',
      description: 'Get personalized guidance from our career advisors. Discuss your unique situation and refine your learning path.',
    },
    {
      title: 'Unlock Premium Plan',
      description: 'Access AI-powered personalized learning, 1:1 mentorship, project reviews, and exclusive community support.',
    },
  ];

  const summary = `Your personalized 12-week transformation from ${inputs.currentRole} to ${inputs.targetGoal}. With ${inputs.weeklyHours} hours per week and your ${skills.slice(0, 3).join(', ')} background, you'll build production-ready AI skills through hands-on projects and structured learning.`;

  return {
    summary,
    prioritized_skills: prioritizedSkills,
    week_plan: weekPlan,
    weekly_schedule: weeklySchedule,
    burnout_tips: burnoutTips,
    next_actions: nextActions,
  };
}

function generatePrioritizedSkills(targetGoal: string, currentSkills: string[]) {
  // Use predefined skills for known roles, otherwise generate generic relevant skills
  const skillsMap: Record<string, Array<{ skill: string; reason: string }>> = {
    'AI/ML Engineer': [
      { skill: 'Python & NumPy', reason: 'Foundation for all ML work and data manipulation' },
      { skill: 'Machine Learning Fundamentals', reason: 'Core algorithms: regression, classification, clustering' },
      { skill: 'Deep Learning with PyTorch/TensorFlow', reason: 'Neural networks for computer vision and NLP' },
      { skill: 'MLOps & Model Deployment', reason: 'Production systems, monitoring, and CI/CD for ML' },
      { skill: 'Statistics & Experiment Design', reason: 'A/B testing, hypothesis testing, model evaluation' },
    ],
    'Applied ML Engineer': [
      { skill: 'Python & Pandas', reason: 'Data wrangling and feature engineering at scale' },
      { skill: 'Scikit-learn & XGBoost', reason: 'Production ML models for classification and regression' },
      { skill: 'Feature Engineering', reason: 'Transform raw data into predictive features' },
      { skill: 'Model Deployment & APIs', reason: 'FastAPI, Docker, and cloud deployment (AWS/GCP)' },
      { skill: 'SQL & Data Pipelines', reason: 'Extract and process data from production databases' },
    ],
    'GenAI Engineer': [
      { skill: 'LLM Fundamentals', reason: 'GPT, Claude, Llama architecture and capabilities' },
      { skill: 'Prompt Engineering', reason: 'Zero-shot, few-shot, chain-of-thought techniques' },
      { skill: 'RAG & Vector Databases', reason: 'Retrieval-augmented generation with Pinecone/Weaviate' },
      { skill: 'LangChain & Agent Frameworks', reason: 'Build autonomous AI agents and workflows' },
      { skill: 'Fine-tuning & Embeddings', reason: 'Customize models for domain-specific tasks' },
    ],
    'AI Tech Lead': [
      { skill: 'ML System Design', reason: 'Architect scalable ML platforms and pipelines' },
      { skill: 'Team Leadership & Mentorship', reason: 'Guide ML engineers and manage technical roadmaps' },
      { skill: 'Production ML at Scale', reason: 'Handle millions of predictions, monitoring, rollbacks' },
      { skill: 'Cost Optimization', reason: 'GPU optimization, batch inference, model compression' },
      { skill: 'Cross-functional Communication', reason: 'Translate business needs into ML solutions' },
    ],
    'Associate Product Manager': [
      { skill: 'Product Strategy & Vision', reason: 'Define product direction, roadmaps, and OKRs' },
      { skill: 'Data-Driven Decision Making', reason: 'Analyze metrics, A/B testing, and user analytics' },
      { skill: 'User Research & Customer Discovery', reason: 'Interview users, validate hypotheses, understand needs' },
      { skill: 'Technical Acumen for PMs', reason: 'Understand engineering constraints and technical feasibility' },
      { skill: 'Cross-functional Leadership', reason: 'Collaborate with engineering, design, and business teams' },
    ],
    'Product Manager': [
      { skill: 'Product Strategy & Roadmapping', reason: 'Build comprehensive product strategies and priorities' },
      { skill: 'Analytics & Metrics', reason: 'Define KPIs, create dashboards, measure impact' },
      { skill: 'User Research & Insights', reason: 'Deep user understanding through research and interviews' },
      { skill: 'Technical Communication', reason: 'Translate between technical teams and stakeholders' },
      { skill: 'Agile & Execution', reason: 'Drive execution, manage backlogs, ship products' },
    ],
    'DevOps Engineer': [
      { skill: 'Infrastructure as Code (Terraform/CloudFormation)', reason: 'Automate cloud infrastructure provisioning' },
      { skill: 'Kubernetes & Container Orchestration', reason: 'Deploy and manage containerized applications at scale' },
      { skill: 'CI/CD Pipelines', reason: 'Automate testing, building, and deployment workflows' },
      { skill: 'Cloud Platforms (AWS/GCP/Azure)', reason: 'Master cloud services, networking, and security' },
      { skill: 'Monitoring & Observability', reason: 'Implement logging, metrics, tracing, and alerting' },
    ],
    'Frontend Engineer': [
      { skill: 'React/Vue/Angular Mastery', reason: 'Build performant, scalable user interfaces' },
      { skill: 'JavaScript/TypeScript Advanced', reason: 'Master modern JS patterns and type safety' },
      { skill: 'State Management (Redux/Context/Zustand)', reason: 'Manage complex application state efficiently' },
      { skill: 'Performance Optimization', reason: 'Optimize rendering, bundle size, and user experience' },
      { skill: 'Web Design & UX Principles', reason: 'Create intuitive, accessible, and beautiful interfaces' },
    ],
    'Data Engineer': [
      { skill: 'SQL & Data Warehousing', reason: 'Design and optimize data warehouse schemas' },
      { skill: 'Big Data Technologies (Spark/Hadoop)', reason: 'Process large-scale data efficiently' },
      { skill: 'ETL Pipeline Development', reason: 'Build reliable data pipelines and transformations' },
      { skill: 'Cloud Data Platforms', reason: 'Work with Snowflake, BigQuery, Redshift, Delta Lake' },
      { skill: 'Data Quality & Testing', reason: 'Ensure data accuracy, completeness, and reliability' },
    ],
  };

  const skills = skillsMap[targetGoal];
  if (skills) {
    return skills.map((s, idx) => ({ ...s, priority: idx + 1 }));
  }

  // For unknown/custom roles, generate generic but relevant skills
  return [
    {
      skill: `${targetGoal}: Core Fundamentals`,
      reason: `Master the essential concepts and foundational knowledge required for ${targetGoal} roles`,
      priority: 1,
    },
    {
      skill: `${targetGoal}: Practical Tools & Technologies`,
      reason: `Learn the industry-standard tools and platforms used in ${targetGoal} positions`,
      priority: 2,
    },
    {
      skill: `${targetGoal}: Advanced Concepts`,
      reason: `Deep dive into specialized knowledge areas that differentiate senior ${targetGoal} professionals`,
      priority: 3,
    },
    {
      skill: `${targetGoal}: Real-World Problem Solving`,
      reason: `Apply knowledge to solve actual business problems faced in ${targetGoal} roles`,
      priority: 4,
    },
    {
      skill: `${targetGoal}: Leadership & Communication`,
      reason: `Develop communication skills and leadership capabilities needed to advance in ${targetGoal}`,
      priority: 5,
    },
  ];
}

function generate12WeekPlan(targetGoal: string) {
  const plansMap: Record<string, Array<{ focus: string; outcome: string; mini_project: string }>> = {
    'Associate Product Manager': [
      { focus: 'Product Fundamentals & Strategy', outcome: 'Understand product-market fit, roadmaps, and strategy frameworks', mini_project: 'Analyze 3 successful product launches and document strategy' },
      { focus: 'User Research & Discovery', outcome: 'Learn interview techniques, surveys, and user research methodologies', mini_project: 'Conduct 5 user interviews and synthesize insights' },
      { focus: 'Data Analytics for PMs', outcome: 'Master Google Analytics, dashboards, and KPI definitions', mini_project: 'Create comprehensive analytics dashboard for a website' },
      { focus: 'Technical Fundamentals', outcome: 'Understand APIs, databases, and technical constraints', mini_project: 'Learn API documentation and build integration spec' },
      { focus: 'Wireframing & Prototyping', outcome: 'Use Figma to create wireframes and basic prototypes', mini_project: 'Design wireframes for a new product feature' },
      { focus: 'A/B Testing & Experimentation', outcome: 'Design experiments, statistical significance, analysis', mini_project: 'Plan and analyze a mock A/B test' },
      { focus: 'Market Research & Competitive Analysis', outcome: 'Research competitors, market trends, positioning', mini_project: 'Create competitive analysis document for a market' },
      { focus: 'Agile & Scrum Fundamentals', outcome: 'Learn agile methodologies, sprints, user stories', mini_project: 'Write user stories for a feature and create sprint plan' },
      { focus: 'Stakeholder Communication', outcome: 'Present findings, manage expectations, build alignment', mini_project: 'Create and deliver pitch deck for a feature idea' },
      { focus: 'Product Metrics & OKRs', outcome: 'Define OKRs, create KPIs, measure success', mini_project: 'Write OKRs for a product area for a quarter' },
      { focus: 'Product Roadmapping', outcome: 'Prioritize features, create roadmaps, communicate priorities', mini_project: 'Build a realistic 6-month product roadmap' },
      { focus: 'Capstone: PM Simulation', outcome: 'Apply all PM skills to a realistic scenario', mini_project: 'Complete end-to-end product case study with presentation' },
    ],
    'DevOps Engineer': [
      { focus: 'Infrastructure Fundamentals', outcome: 'Cloud computing concepts, networking, security basics', mini_project: 'Set up VPC, security groups, and basic networking on AWS' },
      { focus: 'Linux & Bash Mastery', outcome: 'Advanced Linux commands, shell scripting, automation', mini_project: 'Write Bash scripts to automate common server tasks' },
      { focus: 'Infrastructure as Code (Terraform)', outcome: 'IaC principles, Terraform syntax, state management', mini_project: 'Create reusable Terraform modules for EC2 and RDS' },
      { focus: 'Docker & Containerization', outcome: 'Docker concepts, Dockerfiles, multi-stage builds, security', mini_project: 'Containerize a multi-tier application with Docker Compose' },
      { focus: 'Kubernetes Fundamentals', outcome: 'Pods, deployments, services, persistent volumes', mini_project: 'Deploy microservices application to Kubernetes cluster' },
      { focus: 'CI/CD Pipelines (Jenkins/GitLab CI)', outcome: 'Build pipelines, automated testing, deployment automation', mini_project: 'Create full CI/CD pipeline with testing and deployment stages' },
      { focus: 'Cloud Platform Mastery (AWS/GCP)', outcome: 'Compute, storage, networking, databases, monitoring', mini_project: 'Build multi-tier application architecture on cloud' },
      { focus: 'Monitoring & Observability', outcome: 'Prometheus, Grafana, ELK stack, logging, tracing', mini_project: 'Implement comprehensive monitoring and alerting system' },
      { focus: 'Security & Compliance', outcome: 'IAM, encryption, security best practices, compliance frameworks', mini_project: 'Audit and secure an infrastructure setup' },
      { focus: 'Database Administration', outcome: 'Database concepts, backups, replication, performance tuning', mini_project: 'Set up highly available database with automated backups' },
      { focus: 'Incident Response & On-Call', outcome: 'Runbooks, incident management, postmortems, automation', mini_project: 'Create runbooks and incident response procedures' },
      { focus: 'Capstone: Infrastructure Project', outcome: 'Design and build production-ready infrastructure', mini_project: 'Build complete infrastructure for scalable application' },
    ],
    'Frontend Engineer': [
      { focus: 'Modern JavaScript/TypeScript', outcome: 'ES6+, async/await, closures, async programming patterns', mini_project: 'Build utility library with TypeScript and full test coverage' },
      { focus: 'React Fundamentals', outcome: 'Components, hooks, state management, lifecycle', mini_project: 'Build 5-page React app with multiple components' },
      { focus: 'State Management (Redux/Zustand)', outcome: 'Global state patterns, middleware, dev tools', mini_project: 'Refactor React app to use state management library' },
      { focus: 'CSS & Responsive Design', outcome: 'Flexbox, Grid, responsive patterns, CSS-in-JS', mini_project: 'Create responsive design system with Tailwind/Styled Components' },
      { focus: 'Web Performance Optimization', outcome: 'Lazy loading, code splitting, bundle optimization, metrics', mini_project: 'Audit and optimize performance of existing application' },
      { focus: 'Testing (Unit & Integration)', outcome: 'Jest, React Testing Library, testing patterns', mini_project: 'Write comprehensive tests for React components' },
      { focus: 'API Integration & Data Fetching', outcome: 'REST APIs, GraphQL, error handling, authentication', mini_project: 'Build app that integrates with multiple APIs' },
      { focus: 'Build Tools & Bundlers', outcome: 'Webpack, Vite, module federation, optimization', mini_project: 'Configure custom Webpack setup with optimization' },
      { focus: 'Web Accessibility (A11y)', outcome: 'ARIA, semantic HTML, keyboard navigation, screen readers', mini_project: 'Audit application for accessibility issues' },
      { focus: 'Next.js & Server-Side Rendering', outcome: 'SSR, SSG, API routes, optimization', mini_project: 'Build full-stack application with Next.js' },
      { focus: 'Browser DevTools & Debugging', outcome: 'Chrome DevTools, network analysis, memory profiling', mini_project: 'Debug and optimize complex React application' },
      { focus: 'Capstone: Full-Scale Application', outcome: 'Build production-ready frontend application', mini_project: 'Create portfolio-worthy full-featured application' },
    ],
    'Data Engineer': [
      { focus: 'SQL Mastery & Advanced Queries', outcome: 'Complex joins, CTEs, window functions, query optimization', mini_project: 'Write 50+ complex SQL queries and optimize execution' },
      { focus: 'Data Warehouse Design', outcome: 'Schema design, dimensional modeling, star schema', mini_project: 'Design data warehouse for e-commerce company' },
      { focus: 'ETL Pipeline Fundamentals', outcome: 'Data extraction, transformation, loading processes', mini_project: 'Build ETL pipeline extracting data from multiple sources' },
      { focus: 'Apache Spark Basics', outcome: 'RDDs, DataFrames, transformations, actions', mini_project: 'Process large dataset using Spark on local cluster' },
      { focus: 'Big Data Processing (Spark/Hadoop)', outcome: 'Distributed computing, MapReduce, Spark optimization', mini_project: 'Build Spark application processing billions of records' },
      { focus: 'Cloud Data Platforms (Snowflake/BigQuery)', outcome: 'Cloud DW architecture, querying, optimization', mini_project: 'Migrate on-premises DW to cloud platform' },
      { focus: 'Data Pipelines & Orchestration', outcome: 'Airflow, Prefect, scheduling, dependency management', mini_project: 'Build orchestrated data pipeline with Airflow' },
      { focus: 'Data Quality & Testing', outcome: 'Data validation, quality checks, anomaly detection', mini_project: 'Implement comprehensive data quality framework' },
      { focus: 'Real-Time Data Streaming', outcome: 'Kafka, Pub/Sub, streaming architecture, Flink', mini_project: 'Build real-time data pipeline with Kafka' },
      { focus: 'Data Modeling & Governance', outcome: 'Data lineage, metadata management, privacy', mini_project: 'Create data governance and lineage documentation' },
      { focus: 'Performance Tuning & Optimization', outcome: 'Query optimization, indexing, partitioning strategies', mini_project: 'Optimize slow data pipelines and queries' },
      { focus: 'Capstone: Data Platform Project', outcome: 'Design and build production data platform', mini_project: 'Build end-to-end scalable data platform' },
    ],
    'AI/ML Engineer': [
      { focus: 'Python & ML Libraries', outcome: 'NumPy, Pandas, Matplotlib proficiency', mini_project: 'Data analysis notebook on Kaggle dataset' },
      { focus: 'Supervised Learning', outcome: 'Linear/logistic regression, decision trees', mini_project: 'House price predictor with feature engineering' },
      { focus: 'Model Evaluation', outcome: 'Cross-validation, metrics, bias-variance', mini_project: 'Compare 5 algorithms on classification task' },
      { focus: 'Neural Networks Basics', outcome: 'Perceptrons, backpropagation, activations', mini_project: 'MNIST digit classifier from scratch' },
      { focus: 'Deep Learning with PyTorch', outcome: 'CNNs, transfer learning, ResNet', mini_project: 'Image classifier with 95%+ accuracy' },
      { focus: 'NLP Fundamentals', outcome: 'Tokenization, embeddings, RNNs', mini_project: 'Sentiment analysis on movie reviews' },
      { focus: 'Advanced NLP: Transformers', outcome: 'BERT, attention mechanisms', mini_project: 'Fine-tune BERT for text classification' },
      { focus: 'MLOps: Experiment Tracking', outcome: 'MLflow, DVC, versioning', mini_project: 'Track experiments for hyperparameter tuning' },
      { focus: 'Model Deployment', outcome: 'FastAPI, Docker, AWS SageMaker', mini_project: 'Deploy model as REST API with monitoring' },
      { focus: 'A/B Testing & Metrics', outcome: 'Statistical significance, confidence intervals', mini_project: 'Design experiment for model rollout' },
      { focus: 'Advanced Topics', outcome: 'Reinforcement learning or GANs', mini_project: 'Build RL agent for simple game' },
      { focus: 'Capstone Project', outcome: 'End-to-end ML system', mini_project: 'Production ML pipeline with CI/CD' },
    ],
    'Applied ML Engineer': [
      { focus: 'Python & Data Wrangling', outcome: 'Pandas, data cleaning, EDA', mini_project: 'Clean and analyze messy real-world dataset' },
      { focus: 'Feature Engineering', outcome: 'Create predictive features from raw data', mini_project: 'Engineer 20+ features for churn prediction' },
      { focus: 'Scikit-learn Models', outcome: 'Random forests, SVM, ensemble methods', mini_project: 'Customer segmentation with clustering' },
      { focus: 'XGBoost & LightGBM', outcome: 'Gradient boosting for tabular data', mini_project: 'Kaggle competition submission (top 25%)' },
      { focus: 'Model Evaluation & Tuning', outcome: 'GridSearch, ROC curves, F1 scores', mini_project: 'Optimize model for imbalanced dataset' },
      { focus: 'SQL for ML', outcome: 'Complex joins, window functions, CTEs', mini_project: 'Extract features from production database' },
      { focus: 'Data Pipelines', outcome: 'Airflow, scheduled jobs, data validation', mini_project: 'Automate feature extraction pipeline' },
      { focus: 'FastAPI & Model Serving', outcome: 'REST APIs, request validation, logging', mini_project: 'Serve model with 50ms latency' },
      { focus: 'Docker & Containers', outcome: 'Containerize ML apps, multi-stage builds', mini_project: 'Dockerize model + API + monitoring' },
      { focus: 'Cloud Deployment (AWS)', outcome: 'EC2, S3, Lambda, SageMaker basics', mini_project: 'Deploy model to AWS with auto-scaling' },
      { focus: 'Monitoring & Logging', outcome: 'Track predictions, detect drift, alerts', mini_project: 'Set up Prometheus + Grafana dashboard' },
      { focus: 'Production System', outcome: 'End-to-end ML service', mini_project: 'Build production-ready fraud detection system' },
    ],
    'GenAI Engineer': [
      { focus: 'LLM Fundamentals', outcome: 'Understand GPT, Claude, Llama architectures', mini_project: 'Compare 3 LLMs on reasoning tasks' },
      { focus: 'Prompt Engineering', outcome: 'Zero-shot, few-shot, chain-of-thought', mini_project: 'Build prompt library for common tasks' },
      { focus: 'OpenAI/Anthropic APIs', outcome: 'Function calling, streaming, tokens', mini_project: 'AI assistant with structured outputs' },
      { focus: 'Embeddings & Semantic Search', outcome: 'Vector representations, cosine similarity', mini_project: 'Document search engine with embeddings' },
      { focus: 'Vector Databases', outcome: 'Pinecone, Weaviate, or Chroma setup', mini_project: 'Store and query 10K+ documents' },
      { focus: 'RAG (Retrieval-Augmented Gen)', outcome: 'Combine retrieval + LLM generation', mini_project: 'Build Q&A system over custom docs' },
      { focus: 'LangChain Basics', outcome: 'Chains, agents, memory, tools', mini_project: 'Multi-step agent with web search tool' },
      { focus: 'Advanced Agents', outcome: 'ReAct, autonomous decision-making', mini_project: 'Research agent that gathers + summarizes info' },
      { focus: 'Fine-tuning LLMs', outcome: 'LoRA, PEFT, custom training', mini_project: 'Fine-tune Llama for domain-specific task' },
      { focus: 'Evaluation & Testing', outcome: 'LLM evals, human-in-the-loop', mini_project: 'Build evaluation suite for RAG system' },
      { focus: 'Production GenAI', outcome: 'Rate limits, caching, cost optimization', mini_project: 'Deploy chatbot with < $0.01 per query' },
      { focus: 'Capstone: GenAI App', outcome: 'Full-stack GenAI application', mini_project: 'AI-powered code reviewer or content generator' },
    ],
    'AI Tech Lead': [
      { focus: 'ML System Design Principles', outcome: 'Scalability, latency, throughput trade-offs', mini_project: 'Design doc for recommendation system' },
      { focus: 'Team & Project Management', outcome: 'Agile for ML, sprint planning, roadmaps', mini_project: 'Create 6-month ML roadmap for team' },
      { focus: 'Model Architecture Decisions', outcome: 'When to use DL vs. XGBoost vs. rules', mini_project: 'Architecture review for 3 use cases' },
      { focus: 'Data Strategy', outcome: 'Data pipelines, governance, quality', mini_project: 'Design data platform for ML at scale' },
      { focus: 'Production ML Patterns', outcome: 'Batch vs. online, caching, feature stores', mini_project: 'Migrate batch model to real-time serving' },
      { focus: 'Monitoring & Observability', outcome: 'Model drift, data drift, alerting', mini_project: 'Build monitoring dashboard for 5 models' },
      { focus: 'Cost Optimization', outcome: 'GPU utilization, batch inference, pruning', mini_project: 'Reduce inference cost by 50%' },
      { focus: 'A/B Testing at Scale', outcome: 'Multi-armed bandits, experiment design', mini_project: 'Design experiment for multi-model comparison' },
      { focus: 'Cross-functional Communication', outcome: 'Translate business to ML requirements', mini_project: 'Write ML feasibility doc for stakeholders' },
      { focus: 'Hiring & Mentorship', outcome: 'Interview ML candidates, grow juniors', mini_project: 'Create ML interview rubric + onboarding plan' },
      { focus: 'Incident Response', outcome: 'Handle model failures, rollback strategies', mini_project: 'Write runbook for ML production incidents' },
      { focus: 'Strategic Planning', outcome: 'AI/ML vision for organization', mini_project: 'Present ML strategy to executive team' },
    ],
  };

  // If plan exists for this goal, use it; otherwise generate a generic plan
  const plan = plansMap[targetGoal];
  if (plan) {
    return plan.map((p, idx) => ({ week: idx + 1, ...p }));
  }

  // Generate a generic 12-week plan for custom/unknown roles
  const genericWeeks = [
    { focus: `${targetGoal}: Foundations & Fundamentals`, outcome: 'Understand core concepts and prerequisites', mini_project: 'Create learning resource collection' },
    { focus: `Core Skills Week 1: Knowledge Building`, outcome: 'Deep dive into primary skill area', mini_project: 'Complete beginner course module' },
    { focus: `Core Skills Week 2: Practical Application`, outcome: 'Apply concepts through hands-on work', mini_project: 'Build simple project or exercise' },
    { focus: `Core Skills Week 3: Intermediate Concepts`, outcome: 'Learn advanced variations and patterns', mini_project: 'Implement intermediate-level feature' },
    { focus: `Advanced Topics Week 1: Specialized Skills`, outcome: 'Explore advanced/specialized areas', mini_project: 'Research and document best practices' },
    { focus: `Advanced Topics Week 2: Integration`, outcome: 'Combine multiple concepts', mini_project: 'Build more complex project' },
    { focus: `Industry Standards & Tools`, outcome: 'Learn industry-standard tools and practices', mini_project: 'Set up professional development environment' },
    { focus: `Real-World Problem Solving`, outcome: 'Apply skills to realistic scenarios', mini_project: 'Solve 3+ real-world case studies' },
    { focus: `Performance & Optimization`, outcome: 'Learn performance tuning and best practices', mini_project: 'Optimize existing solution' },
    { focus: `System Design & Architecture`, outcome: 'Think about larger system design', mini_project: 'Design system for scalability' },
    { focus: `Production Readiness`, outcome: 'Prepare work for real-world deployment', mini_project: 'Add testing, documentation, CI/CD' },
    { focus: `Capstone Project & Mastery`, outcome: 'Demonstrate comprehensive skill mastery', mini_project: 'Complete end-to-end capstone project' },
  ];

  return genericWeeks.map((w, idx) => ({ week: idx + 1, ...w }));
}

function generateWeeklySchedule(
  weeklyHours: number,
  timeSlot: string,
  weekdayDuration: number,
  weekendDuration: number,
  needsCommuteTasks: boolean
) {
  if (weeklyHours === 0) {
    return [
      { day: 'Monday', slot: timeSlot, duration_min: 20, task: 'Watch tutorial video or read article' },
      { day: 'Tuesday', slot: 'Rest', duration_min: 0, task: 'Rest and reflection' },
      { day: 'Wednesday', slot: 'Rest', duration_min: 0, task: 'Buffer for life priorities' },
      { day: 'Thursday', slot: timeSlot, duration_min: 20, task: 'Practice coding exercises' },
      { day: 'Friday', slot: 'Rest', duration_min: 0, task: 'Rest and recharge' },
      { day: 'Saturday', slot: 'Rest', duration_min: 0, task: 'Optional: review notes if time permits' },
      { day: 'Sunday', slot: 'Rest', duration_min: 0, task: 'Plan upcoming week' },
    ];
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const schedule = [];

  let commuteTasksAdded = 0;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const isWeekend = day === 'Saturday' || day === 'Sunday';
    const duration = isWeekend ? weekendDuration : weekdayDuration;

    let task = '';
    if (i === 0) {
      if (needsCommuteTasks && commuteTasksAdded < 2) {
        task = 'Audio course or podcast (commute-friendly)';
        commuteTasksAdded++;
      } else {
        task = 'Video tutorial + note-taking';
      }
    } else if (i === 1) {
      task = 'Hands-on coding exercises';
    } else if (i === 2) {
      if (needsCommuteTasks && commuteTasksAdded < 2) {
        task = 'Reading technical articles or docs (commute-friendly)';
        commuteTasksAdded++;
      } else {
        task = 'Read documentation and examples';
      }
    } else if (i === 3) {
      task = 'Work on mini-project';
    } else if (i === 4) {
      task = 'Code review and debugging';
    } else if (i === 5) {
      task = 'Deep work: build project feature';
    } else if (i === 6) {
      task = 'Review week, plan next, optional challenge';
    }

    schedule.push({ day, slot: timeSlot, duration_min: duration, task });
  }

  return schedule;
}

function generateBurnoutTips(weeklyHours: number): string[] {
  const baseTips = [
    'Take 5-minute breaks every 25 minutes using Pomodoro technique',
    'If you miss a day, don\'t try to "catch up" - just continue with tomorrow\'s plan',
    'Focus on depth over breadth: master one concept before moving to the next',
    'Join online communities (Discord, Reddit) for support and accountability',
  ];

  if (weeklyHours <= 3) {
    baseTips.push('Quality over quantity: 30 focused minutes beats 2 distracted hours');
    baseTips.push('Celebrate small wins: finishing one tutorial is progress');
  } else if (weeklyHours > 10) {
    baseTips.push('Schedule mandatory rest days to avoid diminishing returns');
    baseTips.push('Watch for signs of fatigue: if retention drops, take a break');
  } else {
    baseTips.push('Build consistency: same time each day creates a habit loop');
  }

  return baseTips;
}

// ============================================================================
// Main Handler
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    const rateLimitCheck = checkRateLimit(clientIP);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimitCheck.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const validationResult = validateInputs(body);

    if (!validationResult.ok) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const inputs = validationResult.data;

    // Check cache
    const inputHash = hashInputs(inputs);
    const cachedPlan = getCachedPlan(inputHash);

    if (cachedPlan) {
      console.log('Returning cached plan for input hash:', inputHash);
      return NextResponse.json(cachedPlan);
    }

    // Try to generate plan with AI
    let plan: UpskillPlan;

    try {
      console.log('Generating plan with AI for input hash:', inputHash);
      plan = await generatePlanWithAI(inputs);
    } catch (aiError) {
      const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
      console.warn('AI generation failed, falling back to deterministic plan:', errorMessage);

      // Fallback to deterministic plan
      plan = generateDeterministicPlan(inputs);
    }

    // Cache the plan
    cachePlan(inputHash, plan);

    return NextResponse.json(plan);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('API error:', errorMessage);

    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}

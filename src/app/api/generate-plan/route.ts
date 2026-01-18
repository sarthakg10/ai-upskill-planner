// API route for generating upskill plan

import { NextRequest, NextResponse } from 'next/server';
import { validateInputs } from '@/lib/validation';
import { UpskillPlan, UpskillInputs } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json();

    // Validate inputs
    const validationResult = validateInputs(body);
    if (!validationResult.ok) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const inputs = validationResult.data;

    // Generate deterministic plan
    const plan = generateDeterministicPlan(inputs);

    return NextResponse.json(plan);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function generateDeterministicPlan(inputs: UpskillInputs): UpskillPlan {
  // Infer default skills if empty
  const skills = inputs.currentSkills.length > 0
    ? inputs.currentSkills
    : ['Java', 'Spring Boot', 'SQL', 'REST APIs'];

  // Determine time slot based on preferences
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

  // Determine duration based on weekly hours
  let weekdayDuration = 30;
  let weekendDuration = 90;
  if (inputs.weeklyHours <= 3) {
    weekdayDuration = 25;
    weekendDuration = 60;
  } else {
    weekdayDuration = 40;
    weekendDuration = 90;
  }

  // Check if commute-friendly tasks needed
  const needsCommuteTasks = inputs.commuteMinutesPerDay >= 60;

  // Generate weekly schedule
  const weeklySchedule = generateWeeklySchedule(
    inputs.weeklyHours,
    timeSlot,
    weekdayDuration,
    weekendDuration,
    needsCommuteTasks
  );

  // Generate prioritized skills
  const prioritizedSkills = generatePrioritizedSkills(inputs.targetGoal, skills);

  // Generate 12-week plan
  const weekPlan = generate12WeekPlan(inputs.targetGoal);

  // Generate burnout tips
  const burnoutTips = generateBurnoutTips(inputs.weeklyHours);

  // Generate next actions
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

  // Generate summary
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
  };

  const skills = skillsMap[targetGoal] || skillsMap['AI/ML Engineer'];
  return skills.map((s, idx) => ({ ...s, priority: idx + 1 }));
}

function generate12WeekPlan(targetGoal: string) {
  const plansMap: Record<string, Array<{ focus: string; outcome: string; mini_project: string }>> = {
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

  const plan = plansMap[targetGoal] || plansMap['AI/ML Engineer'];
  return plan.map((p, idx) => ({ week: idx + 1, ...p }));
}

function generateWeeklySchedule(
  weeklyHours: number,
  timeSlot: string,
  weekdayDuration: number,
  weekendDuration: number,
  needsCommuteTasks: boolean
): Array<{ day: string; slot: string; duration_min: number; task: string }> {
  if (weeklyHours === 0) {
    // Minimum viable plan: only 2 learning sessions
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

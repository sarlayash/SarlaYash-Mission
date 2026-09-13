import { Track, TrackDay, Badge } from '../types';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-genai',
    slug: 'generative-ai',
    name: 'Generative AI Practitioner & Builder',
    description: 'Understand, use, evaluate, and apply generative AI to create useful outputs, workflows, and production solutions.',
    duration_days: 30,
    theory_percentage: 10,
    hands_on_percentage: 90,
    status: 'active',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'track-agentic',
    slug: 'agentic-ai',
    name: 'Agentic AI Systems & Architecture',
    description: 'Learn how AI systems use tools, context, planning, workflows, and controlled actions to accomplish meaningful real-world tasks.',
    duration_days: 30,
    theory_percentage: 10,
    hands_on_percentage: 90,
    status: 'active',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-explorer',
    name: 'Zero-To-Infinity Explorer',
    slug: 'explorer',
    description: 'Joined the 30-day mission and completed orientation on Day 1.',
    criteria: 'Complete Day 1 learning mission and profile onboarding in either track.',
    icon_name: 'Compass',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'badge-genai-foundations',
    track_id: 'track-genai',
    name: 'Generative AI Foundations',
    slug: 'genai-foundations',
    description: 'Mastered core LLM fundamentals, prompt design patterns, and context constraints.',
    criteria: 'Complete Days 1 through 7 of the Generative AI track.',
    icon_name: 'Sparkles',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'badge-prompt-practitioner',
    track_id: 'track-genai',
    name: 'Prompt Engineering Practitioner',
    slug: 'prompt-practitioner',
    description: 'Demonstrated proficiency in structured outputs, system prompts, few-shot prompting, and hallucination prevention.',
    criteria: 'Achieve verified status on assignments Days 3 through 8.',
    icon_name: 'Terminal',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'badge-genai-builder',
    track_id: 'track-genai',
    name: 'Generative AI Builder',
    slug: 'genai-builder',
    description: 'Built multimodal workflows, coding automation systems, and midpoint project.',
    criteria: 'Successfully submit and pass Day 15 Midpoint Practical Project.',
    icon_name: 'Cpu',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'badge-agentic-foundations',
    track_id: 'track-agentic',
    name: 'Agentic AI Foundations',
    slug: 'agentic-foundations',
    description: 'Understood agent architecture, goals, decomposition, state management, and memory paradigms.',
    criteria: 'Complete Days 1 through 7 of the Agentic AI track.',
    icon_name: 'Bot',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'badge-agentic-workflow-builder',
    track_id: 'track-agentic',
    name: 'Agentic Workflow Builder',
    slug: 'agentic-workflow-builder',
    description: 'Designed autonomous tool-calling loops, RAG grounding, and error-recovery pipelines.',
    criteria: 'Successfully submit Day 15 Midpoint Agent Workflow Project.',
    icon_name: 'Layers',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'badge-responsible-ai',
    name: 'Responsible AI Practitioner',
    slug: 'responsible-ai',
    description: 'Applied ethics, safety guardrails, prompt injection defenses, and compliance standards.',
    criteria: 'Complete Day 26 safety and responsible AI assignments.',
    icon_name: 'ShieldCheck',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'badge-genai-completion',
    track_id: 'track-genai',
    name: 'Generative AI Track Completion',
    slug: 'genai-track-completion',
    description: 'Completed all 30 days of Generative AI curriculum and Capstone Project.',
    criteria: 'Complete 30 days of Generative AI track with reviewed final project.',
    icon_name: 'Award',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'badge-agentic-completion',
    track_id: 'track-agentic',
    name: 'Agentic AI Track Completion',
    slug: 'agentic-track-completion',
    description: 'Completed all 30 days of Agentic AI curriculum and Capstone Autonomous Agent System.',
    criteria: 'Complete 30 days of Agentic AI track with reviewed final project.',
    icon_name: 'Trophy',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'badge-dual-track',
    name: 'Dual-Track AI Journey Completion',
    slug: 'dual-track-mastery',
    description: 'Mastered both Generative AI and Agentic AI 30-Day Missions under SarlaYash Mission.',
    criteria: 'Earn completion credentials across both parallel tracks.',
    icon_name: 'Infinity',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString()
  }
];

// Generative AI track 30 days
const GENAI_DAYS_METADATA = [
  { day: 1, title: 'AI Foundations and Learning Setup', obj: 'Configure your AI development environment, explore foundational transformer concepts, and create your mission scratchpad.', tools: ['Gemini Studio', 'VS Code / Web Sandbox'] },
  { day: 2, title: 'Understanding Generative AI', obj: 'Deconstruct tokens, temperature, top-k, and sampling parameters through side-by-side empirical testing.', tools: ['AI Studio', 'Open Web Tools'] },
  { day: 3, title: 'Prompting Fundamentals', obj: 'Implement clear role-definition, direct imperative commands, and delimiter separation in real prompts.', tools: ['AI Studio Playground'] },
  { day: 4, title: 'Context, Instructions, and Constraints', obj: 'Engineer negative constraints, boundaries, and explicit edge-case instructions for reliable model adherence.', tools: ['Prompt Validator'] },
  { day: 5, title: 'Prompt Patterns for Better Outputs', obj: 'Master Few-Shot learning, Chain-of-Thought (CoT), Persona adoption, and ReAct prompting patterns.', tools: ['Interactive Prompt Lab'] },
  { day: 6, title: 'Structured Outputs and Formatting', obj: 'Enforce strict JSON schemas, TypeScript interfaces, and markdown tables directly from model responses.', tools: ['JSON Schema Validator'] },
  { day: 7, title: 'Research, Fact-Checking, and Hallucination Awareness', obj: 'Identify hallucination patterns, implement verification constraints, and use grounding techniques.', tools: ['Grounding Workbench'] },
  { day: 8, title: 'Working with Documents and Knowledge', obj: 'Process dense multi-page documentation, extract key parameters, and synthesize comparative briefs.', tools: ['Document Ingestion Lab'] },
  { day: 9, title: 'Summarization and Information Extraction', obj: 'Build executive summary pipelines with configurable length, bullet density, and sentiment indices.', tools: ['Text Extraction Script'] },
  { day: 10, title: 'Generative AI for Writing and Communication', obj: 'Draft high-impact professional correspondence, policy briefs, and technical whitepapers with tone tuning.', tools: ['Editorial Workspace'] },
  { day: 11, title: 'Generative AI for Presentations and Visual Ideation', obj: 'Synthesize structured deck outlines, slide speaker notes, and visual conceptual prompts.', tools: ['Slide Composer'] },
  { day: 12, title: 'Generative AI for Spreadsheets and Data Tasks', obj: 'Clean raw CSV datasets, generate advanced formulas, and create data transformation scripts.', tools: ['CSV Data Studio'] },
  { day: 13, title: 'Generative AI for Coding Assistance', obj: 'Leverage LLMs for modular code synthesis, interface declaration, and unit test generation.', tools: ['TypeScript / Python Dev IDE'] },
  { day: 14, title: 'Debugging and Reviewing AI-Generated Code', obj: 'Audit AI-generated code for security vulnerabilities, syntax traps, memory leaks, and logic flaws.', tools: ['Static Code Analyzer'] },
  { day: 15, title: 'Midpoint Practical Project', obj: 'Design, build, and deploy an end-to-end Generative AI mini-application solving a real-world task.', tools: ['Full-stack App / Web App'] },
  { day: 16, title: 'Multimodal AI', obj: 'Process multimodal inputs: images, charts, audio waveforms, and spatial diagrams in a single context.', tools: ['Multimodal API Lab'] },
  { day: 17, title: 'Image and Design Workflows', obj: 'Generate visual assets, diagrams, user journey mockups, and evaluate fidelity against design requirements.', tools: ['Image Generation Models'] },
  { day: 18, title: 'Audio, Speech, and Video Workflows', obj: 'Explore speech-to-text, audio analysis, script-to-voice synthesis, and video chaptering pipelines.', tools: ['Audio / Speech Studio'] },
  { day: 19, title: 'AI-Assisted Research Workflow', obj: 'Design a systematic literature review and patent analysis workflow with cross-reference validation.', tools: ['Academic Research Tools'] },
  { day: 20, title: 'AI for Productivity and Personal Knowledge', obj: 'Build a personalized second-brain knowledge capture and retrieval workflow.', tools: ['Obsidian / Markdown System'] },
  { day: 21, title: 'AI for Education and Training', obj: 'Construct adaptive tutoring modules, diagnostic quizzes, and step-by-step concept explanations.', tools: ['Curriculum Composer'] },
  { day: 22, title: 'AI for Business Operations', obj: 'Automate invoice intake, meeting action item triage, and standard operating procedure synthesis.', tools: ['Workflow Engine'] },
  { day: 23, title: 'AI for Marketing and Content Systems', obj: 'Create cross-platform content campaigns with brand voice consistency and SEO alignment.', tools: ['Campaign Generator'] },
  { day: 24, title: 'AI for Career and Professional Work', obj: 'Optimize portfolios, practice rigorous case study interviews, and tailor executive profiles.', tools: ['Career Portfolio Lab'] },
  { day: 25, title: 'Evaluation, Quality, and Reliability', obj: 'Implement automated evaluation benchmarks, LLM-as-a-judge rubrics, and regression test suites.', tools: ['Eval Benchmarks'] },
  { day: 26, title: 'Responsible AI, Privacy, and Safety', obj: 'Audit PII redaction, test jailbreak boundaries, ensure copyright safety, and establish privacy policies.', tools: ['Safety Test Suite'] },
  { day: 27, title: 'Building Reusable Prompt Libraries', obj: 'Construct a version-controlled, parameterized prompt repository with CI/CD integration.', tools: ['Prompt Registry'] },
  { day: 28, title: 'Designing an End-to-End Generative AI Workflow', obj: 'Architect a production-grade multi-stage pipeline with streaming, fallback models, and caching.', tools: ['System Architecture Diagram'] },
  { day: 29, title: 'Final Practical Project', obj: 'Finalize your flagship capstone application with comprehensive documentation and unit test coverage.', tools: ['Production Project Repository'] },
  { day: 30, title: 'Project Showcase, Reflection, and Credential Completion', obj: 'Present your completed capstone, review 30-day learning metrics, and claim your verified certificate.', tools: ['SarlaYash Mission Verification'] }
];

// Agentic AI track 30 days
const AGENTIC_DAYS_METADATA = [
  { day: 1, title: 'What Is Agentic AI?', obj: 'Contrast passive LLM query-response loops with proactive goal-seeking agentic systems.', tools: ['Agentic Concept Matrix'] },
  { day: 2, title: 'AI Assistants vs AI Agents', obj: 'Analyze agency spectrum: from assistive autocomplete to autonomous multi-step execution environments.', tools: ['Agency Classification Tool'] },
  { day: 3, title: 'Agent Components and Architecture', obj: 'Deconstruct agent anatomy: Perception, Planning, Memory, Action Engine, and Environmental Feedback.', tools: ['Architecture Blueprint'] },
  { day: 4, title: 'Goals, Instructions, and Task Decomposition', obj: 'Break down complex high-level objectives into hierarchical Directed Acyclic Graphs (DAGs) of executable subtasks.', tools: ['DAG Task Planner'] },
  { day: 5, title: 'Context Windows, Memory, and State', obj: 'Implement short-term working scratchpads, conversational history buffers, and long-term vector storage.', tools: ['Memory State Machine'] },
  { day: 6, title: 'Tools, Functions, and External Actions', obj: 'Design deterministic TypeScript function signatures with precise input parameter definitions for LLMs.', tools: ['Function Registry'] },
  { day: 7, title: 'Tool Calling and Structured Schemas', obj: 'Execute model-invoked tool calls, parse argument payloads, handle validation errors, and feed results back.', tools: ['Tool Dispatcher'] },
  { day: 8, title: 'Planning and Execution Loops', obj: 'Build Thought-Action-Observation (ReAct) iterative loops with maximum iteration guards and halt triggers.', tools: ['ReAct Loop Runner'] },
  { day: 9, title: 'Workflows vs Autonomous Agents', obj: 'Evaluate deterministic step-wise workflows versus dynamic autonomous routing based on reliability requirements.', tools: ['Workflow Orchestrator'] },
  { day: 10, title: 'Human-in-the-Loop Design', obj: 'Implement approval checkpoints, permission escalations, and human override hooks for critical actions.', tools: ['Approval Gate Manager'] },
  { day: 11, title: 'Building a Simple Tool-Using Workflow', obj: 'Construct a functional CLI or web agent that searches, computes, and writes to disk autonomously.', tools: ['Node.js / Python Sandbox'] },
  { day: 12, title: 'Knowledge Retrieval and Grounding', obj: 'Connect agents to live knowledge sources, web scrapers, and dynamic API endpoints.', tools: ['Grounding Connector'] },
  { day: 13, title: 'RAG Concepts and Practical Implementation', obj: 'Chunk documents, generate vector embeddings, run similarity searches, and inject contextual citations.', tools: ['Vector Retrieval Engine'] },
  { day: 14, title: 'Agent Evaluation and Testing', obj: 'Measure task completion rate, tool call accuracy, cost per task, and latency across diverse benchmark cases.', tools: ['Agent Eval Suite'] },
  { day: 15, title: 'Midpoint Agent Workflow Project', obj: 'Deploy a multi-step agent that takes an open-ended goal and autonomously executes 5+ linked subtasks.', tools: ['Autonomous Agent Sandbox'] },
  { day: 16, title: 'Multi-Step Task Automation', obj: 'Orchestrate multi-step automation spanning calendar scheduling, email composition, and spreadsheet updates.', tools: ['Automation Dispatcher'] },
  { day: 17, title: 'API Integration Concepts', obj: 'Integrate third-party REST / GraphQL APIs, OAuth tokens, and pagination handling within agent execution.', tools: ['API Adapter Layer'] },
  { day: 18, title: 'Agent Memory Patterns', obj: 'Implement episodic memory, semantic memory, and entity reflection memory for state retention.', tools: ['Episodic Memory Store'] },
  { day: 19, title: 'Guardrails and Permission Boundaries', obj: 'Enforce sandboxing, read-only constraints, domain whitelists, and rate limit boundaries on agent actions.', tools: ['Security Guardrail Engine'] },
  { day: 20, title: 'Error Handling and Recovery', obj: 'Design self-correction loops when tools throw exceptions, timeouts occur, or invalid parameters are emitted.', tools: ['Self-Correction Harness'] },
  { day: 21, title: 'Multi-Agent Systems — Concepts and Tradeoffs', obj: 'Explore orchestrator-worker, peer-to-peer, and hierarchical multi-agent collaboration topologies.', tools: ['Multi-Agent Simulator'] },
  { day: 22, title: 'Agentic AI for Research', obj: 'Build a multi-agent deep research team: Planner, Scraper, Fact-Checker, and Synthesis Writer.', tools: ['Research Agent Team'] },
  { day: 23, title: 'Agentic AI for Education', obj: 'Construct a diagnostic teaching agent that evaluates student submissions and generates custom practice tasks.', tools: ['Educational Agent'] },
  { day: 24, title: 'Agentic AI for Business Operations', obj: 'Create an automated customer service triage agent with escalation paths and ticket management.', tools: ['Operations Agent'] },
  { day: 25, title: 'Agentic AI for Customer and Support Workflows', obj: 'Implement end-to-end dispute resolution agents with strict policy compliance and refund guardrails.', tools: ['Support Pipeline'] },
  { day: 26, title: 'Security, Privacy, and Prompt Injection Awareness', obj: 'Defend agent tools against indirect prompt injections hidden in user files, scraped web data, and emails.', tools: ['Injection Defense Lab'] },
  { day: 27, title: 'Monitoring, Logs, and Observability', obj: 'Track agent execution traces, token consumption, tool execution latency, and step-by-step decision trees.', tools: ['Observability Dashboard'] },
  { day: 28, title: 'Designing a Reliable Agentic System', obj: 'Design fault-tolerant production architecture with retries, fallback agents, and deterministic state backups.', tools: ['Production System Diagram'] },
  { day: 29, title: 'Final Agentic AI Project', obj: 'Build and deploy a complete production-ready agentic AI system solving a complex real-world challenge.', tools: ['Full Agentic Solution Repo'] },
  { day: 30, title: 'Project Showcase, Reflection, and Credential Completion', obj: 'Demonstrate live agent execution, present architecture audit logs, and claim your verified credential.', tools: ['SarlaYash Mission Verification'] }
];

export function generateTrackDays(trackId: string, slug: string): TrackDay[] {
  const metadataList = slug === 'generative-ai' ? GENAI_DAYS_METADATA : AGENTIC_DAYS_METADATA;
  return metadataList.map((item) => ({
    id: `${trackId}-day-${item.day}`,
    track_id: trackId,
    day_number: item.day,
    title: item.title,
    theory_content: `### 10% Foundational Theory: ${item.title}\n\nIn this foundational session, we examine the core architecture governing ${item.title.toLowerCase()}. Understanding the underlying mechanics prevents brittle implementations and unlocks repeatable precision.\n\nKey Concepts:\n- **First Principles**: Moving beyond surface-level syntax to operational principles.\n- **Failure Modes**: How systems degrade under edge cases and how to engineer resilient guardrails.\n- **Industry Standard**: How top Fortune 500 engineering teams structure these workflows in production.`,
    hands_on_objective: item.obj,
    hands_on_activity: `### 90% Hands-On Practical Mission\n\nExecute the following hands-on workflow in your development environment:\n\n1. **Setup & Initialization**: Open your preferred development environment or AI studio workspace.\n2. **Execution Steps**: Construct the solution according to today's objective (${item.obj}).\n3. **Empirical Verification**: Test edge cases and document inputs, expected outputs, and observed behaviors.\n4. **Final Deliverable**: Prepare your code snippet, prompt schema, or architecture log for submission below.`,
    estimated_minutes: 60,
    suggested_tools: item.tools,
    completion_criteria: `Complete hands-on mission steps and submit verifiable work: text explanation, code/prompt artifact, or repository/documentation link.`,
    published: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  }));
}

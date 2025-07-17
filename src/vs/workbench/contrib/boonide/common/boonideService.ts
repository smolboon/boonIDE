/*---------------------------------------------------------------------------------------------
 *  Copyright (c) BoonIDE Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';

export const IBoonIDEService = createDecorator<IBoonIDEService>('boonIDEService');

export enum BoonIDEMode {
    Vibecoding = 'vibecoding',
    SpecCentric = 'spec-centric'
}

export enum AgentStatus {
    Idle = 'idle',
    Active = 'active',
    Busy = 'busy',
    Error = 'error'
}

export interface AgentInfo {
    id: string;
    name: string;
    description: string;
    status: AgentStatus;
    cpuUsage: number;
    memoryUsage: number;
    tasksCompleted: number;
    lastActivity: Date;
}

export interface DevelopmentTask {
    id: string;
    prompt: string;
    mode: BoonIDEMode;
    priority: 'low' | 'medium' | 'high';
    requiredAgents: string[];
    context?: any;
    metadata?: Record<string, any>;
}

export interface TaskResult {
    taskId: string;
    success: boolean;
    result?: any;
    error?: string;
    duration: number;
    agentsUsed: string[];
}

export interface ModeConfig {
    vibecoding: VibeCodingConfig;
    specCentric: SpecCentricConfig;
}

export interface VibeCodingConfig {
    autoSuggestions: boolean;
    suggestionsDelay: number;
    proactiveRefactoring: boolean;
    contextAwareness: number; // 0-100
    flowPreservation: boolean;
    minimumInterruption: boolean;
}

export interface SpecCentricConfig {
    requirementValidation: boolean;
    testDrivenDevelopment: boolean;
    architectureCompliance: boolean;
    formalVerification: boolean;
    documentationGeneration: boolean;
    specificationTracking: boolean;
}

export interface IBoonIDEService {
    readonly _serviceBrand: undefined;

    // Mode management
    readonly currentMode: BoonIDEMode;
    readonly onDidChangeModeConfig: Event<ModeConfig>;
    readonly onDidChangeMode: Event<BoonIDEMode>;
    
    setMode(mode: BoonIDEMode): Promise<void>;
    getModeConfig(): ModeConfig;
    updateModeConfig(config: Partial<ModeConfig>): Promise<void>;

    // Agent management
    readonly onDidChangeAgents: Event<AgentInfo[]>;
    readonly onDidChangeAgentStatus: Event<{ agentId: string; status: AgentStatus }>;
    
    getActiveAgents(): AgentInfo[];
    getAgentById(id: string): AgentInfo | undefined;
    startAgent(agentId: string): Promise<boolean>;
    stopAgent(agentId: string): Promise<boolean>;
    restartAgent(agentId: string): Promise<boolean>;

    // Task execution
    executeTask(task: DevelopmentTask): Promise<TaskResult>;
    executePrompt(prompt: string, mode?: BoonIDEMode): Promise<TaskResult>;
    cancelTask(taskId: string): Promise<boolean>;
    getTaskHistory(): TaskResult[];

    // Quick actions
    generateTests(filePath?: string): Promise<TaskResult>;
    refactorCode(selection?: string): Promise<TaskResult>;
    addDocumentation(target?: string): Promise<TaskResult>;
    optimizeCode(scope?: string): Promise<TaskResult>;

    // Learning and adaptation
    recordUserInteraction(interaction: UserInteraction): void;
    getUserPreferences(): UserPreferences;
    updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void>;
}

export interface UserInteraction {
    timestamp: Date;
    action: string;
    context: string;
    mode: BoonIDEMode;
    success: boolean;
    duration: number;
}

export interface UserPreferences {
    preferredMode: BoonIDEMode;
    vibeCodingPrefs: VibeCodingConfig;
    specCentricPrefs: SpecCentricConfig;
    agentPriorities: Record<string, number>;
    customPrompts: string[];
    learningEnabled: boolean;
}

export abstract class AbstractBoonIDEService extends Disposable implements IBoonIDEService {
    readonly _serviceBrand: undefined;

    protected _currentMode: BoonIDEMode = BoonIDEMode.Vibecoding;
    protected _agents: Map<string, AgentInfo> = new Map();
    protected _taskHistory: TaskResult[] = [];
    protected _userPreferences: UserPreferences;

    abstract readonly onDidChangeModeConfig: Event<ModeConfig>;
    abstract readonly onDidChangeMode: Event<BoonIDEMode>;
    abstract readonly onDidChangeAgents: Event<AgentInfo[]>;
    abstract readonly onDidChangeAgentStatus: Event<{ agentId: string; status: AgentStatus }>;

    get currentMode(): BoonIDEMode {
        return this._currentMode;
    }

    constructor() {
        super();
        this._userPreferences = this.getDefaultUserPreferences();
        this.initializeAgents();
    }

    private getDefaultUserPreferences(): UserPreferences {
        return {
            preferredMode: BoonIDEMode.Vibecoding,
            vibeCodingPrefs: {
                autoSuggestions: true,
                suggestionsDelay: 500,
                proactiveRefactoring: true,
                contextAwareness: 80,
                flowPreservation: true,
                minimumInterruption: true
            },
            specCentricPrefs: {
                requirementValidation: true,
                testDrivenDevelopment: true,
                architectureCompliance: true,
                formalVerification: false,
                documentationGeneration: true,
                specificationTracking: true
            },
            agentPriorities: {
                'context': 10,
                'analysis': 8,
                'generation': 7,
                'validation': 6,
                'communication': 5
            },
            customPrompts: [],
            learningEnabled: true
        };
    }

    private initializeAgents(): void {
        const defaultAgents: AgentInfo[] = [
            {
                id: 'context',
                name: 'Context Agent',
                description: 'Maintains project context and developer intent',
                status: AgentStatus.Active,
                cpuUsage: 5,
                memoryUsage: 128,
                tasksCompleted: 0,
                lastActivity: new Date()
            },
            {
                id: 'analysis',
                name: 'Code Analysis Agent',
                description: 'Analyzes code quality, patterns, and issues',
                status: AgentStatus.Active,
                cpuUsage: 15,
                memoryUsage: 256,
                tasksCompleted: 0,
                lastActivity: new Date()
            },
            {
                id: 'generation',
                name: 'Generation Agent',
                description: 'Generates code, tests, and documentation',
                status: AgentStatus.Idle,
                cpuUsage: 0,
                memoryUsage: 512,
                tasksCompleted: 0,
                lastActivity: new Date()
            },
            {
                id: 'validation',
                name: 'Validation Agent',
                description: 'Validates generated code and ensures quality',
                status: AgentStatus.Idle,
                cpuUsage: 0,
                memoryUsage: 128,
                tasksCompleted: 0,
                lastActivity: new Date()
            },
            {
                id: 'communication',
                name: 'Communication Agent',
                description: 'Handles external integrations and APIs',
                status: AgentStatus.Idle,
                cpuUsage: 0,
                memoryUsage: 64,
                tasksCompleted: 0,
                lastActivity: new Date()
            }
        ];

        defaultAgents.forEach(agent => {
            this._agents.set(agent.id, agent);
        });
    }

    abstract setMode(mode: BoonIDEMode): Promise<void>;
    abstract getModeConfig(): ModeConfig;
    abstract updateModeConfig(config: Partial<ModeConfig>): Promise<void>;

    getActiveAgents(): AgentInfo[] {
        return Array.from(this._agents.values()).filter(agent => agent.status !== AgentStatus.Idle);
    }

    getAgentById(id: string): AgentInfo | undefined {
        return this._agents.get(id);
    }

    abstract startAgent(agentId: string): Promise<boolean>;
    abstract stopAgent(agentId: string): Promise<boolean>;
    abstract restartAgent(agentId: string): Promise<boolean>;

    abstract executeTask(task: DevelopmentTask): Promise<TaskResult>;
    abstract executePrompt(prompt: string, mode?: BoonIDEMode): Promise<TaskResult>;
    abstract cancelTask(taskId: string): Promise<boolean>;

    getTaskHistory(): TaskResult[] {
        return [...this._taskHistory];
    }

    abstract generateTests(filePath?: string): Promise<TaskResult>;
    abstract refactorCode(selection?: string): Promise<TaskResult>;
    abstract addDocumentation(target?: string): Promise<TaskResult>;
    abstract optimizeCode(scope?: string): Promise<TaskResult>;

    recordUserInteraction(interaction: UserInteraction): void {
        // Store interaction for learning
        if (this._userPreferences.learningEnabled) {
            // Implementation would store interaction data
            console.log('Recording user interaction:', interaction);
        }
    }

    getUserPreferences(): UserPreferences {
        return { ...this._userPreferences };
    }

    abstract updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void>;

    protected updateAgent(agentId: string, updates: Partial<AgentInfo>): void {
        const agent = this._agents.get(agentId);
        if (agent) {
            Object.assign(agent, updates, { lastActivity: new Date() });
            this._agents.set(agentId, agent);
        }
    }

    protected addTaskToHistory(result: TaskResult): void {
        this._taskHistory.push(result);
        // Keep only last 100 tasks
        if (this._taskHistory.length > 100) {
            this._taskHistory.splice(0, this._taskHistory.length - 100);
        }
    }
}
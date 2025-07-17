/*---------------------------------------------------------------------------------------------
 *  Copyright (c) BoonIDE Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { IViewDescriptorService, IViewsRegistry, Extensions as ViewExtensions } from '../../../common/views.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import * as DOM from '../../../../base/browser/dom.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { ViewContainer, ViewContainerLocation } from '../../../common/views.js';
import { VIEWLET_ID } from '../../terminal/common/terminal.js';

// Register the BoonIDE icon
const boonideIcon = registerIcon('boonide-panel', Codicon.robot, localize('boonideIcon', 'BoonIDE panel icon'));

// BoonIDE View Container
const BOONIDE_CONTAINER_ID = 'workbench.view.boonide';
const BOONIDE_PANEL_VIEW_ID = 'workbench.panel.boonide.view';

// Create the view container
const boonideViewContainer: ViewContainer = Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViewContainer({
    id: BOONIDE_CONTAINER_ID,
    title: localize('boonide.panel.title', 'BoonIDE'),
    icon: boonideIcon,
    alwaysUseContainerInfo: true,
    order: 100
}, ViewContainerLocation.Panel);

export enum BoonIDEMode {
    Vibecoding = 'vibecoding',
    SpecCentric = 'spec-centric'
}

export interface IBoonIDEService {
    readonly currentMode: BoonIDEMode;
    setMode(mode: BoonIDEMode): void;
    executePrompt(prompt: string): Promise<string>;
    getActiveAgents(): AgentInfo[];
}

export interface AgentInfo {
    id: string;
    name: string;
    status: 'active' | 'idle' | 'busy';
    cpuUsage: number;
}

class BoonIDEPanelView extends ViewPane {
    private container!: HTMLElement;
    private modeToggle!: HTMLElement;
    private promptInput!: HTMLTextAreaElement;
    private agentStatus!: HTMLElement;
    private currentMode: BoonIDEMode = BoonIDEMode.Vibecoding;

    constructor(
        options: IViewPaneOptions,
        @IThemeService themeService: IThemeService,
        @IStorageService storageService: IStorageService,
        @ITelemetryService telemetryService: ITelemetryService,
        @IContextKeyService contextKeyService: IContextKeyService,
        @IInstantiationService private instantiationService: IInstantiationService
    ) {
        super(options, themeService, storageService, telemetryService, contextKeyService);
    }

    protected override renderBody(container: HTMLElement): void {
        this.container = container;
        this.createModeToggle();
        this.createPromptInterface();
        this.createAgentStatus();
        this.createQuickActions();
        this.createAgentLogs();

        // Apply BoonIDE styling
        this.container.style.backgroundColor = '#1E1E1E';
        this.container.style.color = '#F8F8F8';
        this.container.style.padding = '12px';
        this.container.style.height = '100%';
        this.container.style.overflow = 'auto';
    }

    private createModeToggle(): void {
        const modeSection = DOM.append(this.container, DOM.$('.boonide-mode-section'));
        
        const title = DOM.append(modeSection, DOM.$('h3'));
        title.textContent = 'Development Mode';
        title.style.color = '#F8F8F8';
        title.style.marginBottom = '8px';

        this.modeToggle = DOM.append(modeSection, DOM.$('.boonide-mode-toggle'));
        this.modeToggle.style.display = 'flex';
        this.modeToggle.style.marginBottom = '16px';

        const vibecodeBtn = DOM.append(this.modeToggle, DOM.$('button.boonide-mode-btn'));
        vibecodeBtn.textContent = 'Vibecoding';
        vibecodeBtn.style.marginRight = '8px';
        this.styleButton(vibecodeBtn, true);

        const specBtn = DOM.append(this.modeToggle, DOM.$('button.boonide-mode-btn'));
        specBtn.textContent = 'Spec-centric';
        this.styleButton(specBtn, false);

        vibecodeBtn.addEventListener('click', () => this.setMode(BoonIDEMode.Vibecoding));
        specBtn.addEventListener('click', () => this.setMode(BoonIDEMode.SpecCentric));
    }

    private createPromptInterface(): void {
        const promptSection = DOM.append(this.container, DOM.$('.boonide-prompt-section'));
        
        const title = DOM.append(promptSection, DOM.$('h3'));
        title.textContent = 'Prompt Interface';
        title.style.color = '#F8F8F8';
        title.style.marginBottom = '8px';

        this.promptInput = DOM.append(promptSection, DOM.$('textarea.boonide-prompt')) as HTMLTextAreaElement;
        this.promptInput.placeholder = 'What would you like to build? Type your requirements here...';
        this.promptInput.style.width = '100%';
        this.promptInput.style.height = '80px';
        this.promptInput.style.backgroundColor = '#2D2D2D';
        this.promptInput.style.color = '#F8F8F8';
        this.promptInput.style.border = '1px solid #3C3C3C';
        this.promptInput.style.borderRadius = '4px';
        this.promptInput.style.padding = '8px';
        this.promptInput.style.fontFamily = 'monospace';
        this.promptInput.style.fontSize = '13px';
        this.promptInput.style.resize = 'vertical';
        this.promptInput.style.marginBottom = '12px';

        const submitBtn = DOM.append(promptSection, DOM.$('button.boonide-submit'));
        submitBtn.textContent = 'Execute';
        submitBtn.style.backgroundColor = '#93456d';
        submitBtn.style.color = '#F8F8F8';
        submitBtn.style.border = 'none';
        submitBtn.style.borderRadius = '4px';
        submitBtn.style.padding = '8px 16px';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.marginBottom = '16px';

        submitBtn.addEventListener('click', () => this.executePrompt());
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.executePrompt();
            }
        });
    }

    private createAgentStatus(): void {
        const agentSection = DOM.append(this.container, DOM.$('.boonide-agent-section'));
        
        const title = DOM.append(agentSection, DOM.$('h3'));
        title.textContent = 'Active Agents';
        title.style.color = '#F8F8F8';
        title.style.marginBottom = '8px';

        this.agentStatus = DOM.append(agentSection, DOM.$('.boonide-agent-status'));
        this.updateAgentStatus();
        
        // Update agent status every 2 seconds
        setInterval(() => this.updateAgentStatus(), 2000);
    }

    private createQuickActions(): void {
        const actionsSection = DOM.append(this.container, DOM.$('.boonide-actions-section'));
        
        const title = DOM.append(actionsSection, DOM.$('h3'));
        title.textContent = 'Quick Actions';
        title.style.color = '#F8F8F8';
        title.style.marginBottom = '8px';

        const actionsContainer = DOM.append(actionsSection, DOM.$('.boonide-actions'));
        actionsContainer.style.display = 'flex';
        actionsContainer.style.flexWrap = 'wrap';
        actionsContainer.style.gap = '8px';
        actionsContainer.style.marginBottom = '16px';

        const actions = ['Generate Tests', 'Refactor', 'Add Documentation', 'Optimize'];
        actions.forEach(action => {
            const btn = DOM.append(actionsContainer, DOM.$('button.boonide-action-btn'));
            btn.textContent = action;
            this.styleActionButton(btn);
            btn.addEventListener('click', () => this.executeQuickAction(action));
        });
    }

    private createAgentLogs(): void {
        const logsSection = DOM.append(this.container, DOM.$('.boonide-logs-section'));
        
        const title = DOM.append(logsSection, DOM.$('h3'));
        title.textContent = 'Agent Logs';
        title.style.color = '#F8F8F8';
        title.style.marginBottom = '8px';

        const logsContainer = DOM.append(logsSection, DOM.$('.boonide-logs'));
        logsContainer.style.backgroundColor = '#1A1A1A';
        logsContainer.style.border = '1px solid #3C3C3C';
        logsContainer.style.borderRadius = '4px';
        logsContainer.style.padding = '8px';
        logsContainer.style.maxHeight = '200px';
        logsContainer.style.overflow = 'auto';
        logsContainer.style.fontFamily = 'monospace';
        logsContainer.style.fontSize = '12px';

        // Add some sample logs
        this.addLogEntry(logsContainer, '🤖 Code Analysis: Found 3 issues', 'analysis');
        this.addLogEntry(logsContainer, '🤖 Generation: Created 2 functions', 'generation');
        this.addLogEntry(logsContainer, '🤖 Context: Updated project state', 'context');
    }

    private addLogEntry(container: HTMLElement, message: string, type: string): void {
        const entry = DOM.append(container, DOM.$('.log-entry'));
        entry.textContent = new Date().toLocaleTimeString() + ' ' + message;
        entry.style.marginBottom = '4px';
        entry.style.color = this.getLogColor(type);
    }

    private getLogColor(type: string): string {
        switch (type) {
            case 'analysis': return '#4FC3F7';
            case 'generation': return '#81C784';
            case 'context': return '#FFB74D';
            default: return '#F8F8F8';
        }
    }

    private styleButton(button: HTMLButtonElement, active: boolean): void {
        button.style.padding = '6px 12px';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '12px';
        
        if (active) {
            button.style.backgroundColor = '#93456d';
            button.style.color = '#F8F8F8';
        } else {
            button.style.backgroundColor = '#3C3C3C';
            button.style.color = '#CCCCCC';
        }
    }

    private styleActionButton(button: HTMLButtonElement): void {
        button.style.padding = '6px 12px';
        button.style.border = '1px solid #3C3C3C';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '12px';
        button.style.backgroundColor = '#2D2D2D';
        button.style.color = '#F8F8F8';
        
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#93456d';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#2D2D2D';
        });
    }

    private setMode(mode: BoonIDEMode): void {
        this.currentMode = mode;
        
        // Update button states
        const buttons = this.modeToggle.querySelectorAll('button');
        buttons.forEach((btn, index) => {
            const isActive = (index === 0 && mode === BoonIDEMode.Vibecoding) || 
                            (index === 1 && mode === BoonIDEMode.SpecCentric);
            this.styleButton(btn as HTMLButtonElement, isActive);
        });
        
        // Update placeholder text based on mode
        if (mode === BoonIDEMode.Vibecoding) {
            this.promptInput.placeholder = 'Describe what you want to build... Let your creativity flow!';
        } else {
            this.promptInput.placeholder = 'Enter detailed specifications and requirements...';
        }
    }

    private updateAgentStatus(): void {
        if (!this.agentStatus) return;

        // Clear existing status
        this.agentStatus.innerHTML = '';

        // Mock agent data - in real implementation, this would come from the agent service
        const agents: AgentInfo[] = [
            { id: 'analysis', name: 'Code Analysis', status: 'active', cpuUsage: 95 },
            { id: 'generation', name: 'Generation', status: 'busy', cpuUsage: 12 },
            { id: 'context', name: 'Context', status: 'active', cpuUsage: 5 },
            { id: 'validation', name: 'Validation', status: 'idle', cpuUsage: 0 }
        ];

        agents.forEach(agent => {
            const agentItem = DOM.append(this.agentStatus, DOM.$('.agent-item'));
            agentItem.style.display = 'flex';
            agentItem.style.justifyContent = 'space-between';
            agentItem.style.alignItems = 'center';
            agentItem.style.marginBottom = '6px';
            agentItem.style.padding = '4px 8px';
            agentItem.style.backgroundColor = '#2D2D2D';
            agentItem.style.borderRadius = '4px';

            const leftSide = DOM.append(agentItem, DOM.$('.agent-left'));
            leftSide.style.display = 'flex';
            leftSide.style.alignItems = 'center';

            const statusIcon = DOM.append(leftSide, DOM.$('.agent-status-icon'));
            statusIcon.textContent = agent.status === 'active' ? '●' : agent.status === 'busy' ? '◐' : '○';
            statusIcon.style.color = agent.status === 'active' ? '#81C784' : agent.status === 'busy' ? '#FFB74D' : '#616161';
            statusIcon.style.marginRight = '8px';

            const name = DOM.append(leftSide, DOM.$('.agent-name'));
            name.textContent = agent.name;
            name.style.color = '#F8F8F8';

            const cpuUsage = DOM.append(agentItem, DOM.$('.agent-cpu'));
            cpuUsage.textContent = `${agent.cpuUsage}% CPU`;
            cpuUsage.style.color = '#CCCCCC';
            cpuUsage.style.fontSize = '11px';
        });
    }

    private async executePrompt(): Promise<void> {
        const prompt = this.promptInput.value.trim();
        if (!prompt) return;

        // Add to logs
        const logsContainer = this.container.querySelector('.boonide-logs') as HTMLElement;
        this.addLogEntry(logsContainer, `🤖 User: ${prompt}`, 'user');

        // Clear input
        this.promptInput.value = '';

        // Mock execution - in real implementation, this would call the agent service
        setTimeout(() => {
            this.addLogEntry(logsContainer, '🤖 System: Processing request...', 'system');
        }, 500);
    }

    private executeQuickAction(action: string): void {
        const logsContainer = this.container.querySelector('.boonide-logs') as HTMLElement;
        this.addLogEntry(logsContainer, `🤖 Quick Action: ${action}`, 'action');
    }
}

// Register the view
Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViews([{
    id: BOONIDE_PANEL_VIEW_ID,
    name: localize('boonide.panel.view.name', 'BoonIDE Assistant'),
    containerIcon: boonideIcon,
    canToggleVisibility: true,
    canMoveView: true,
    ctorDescriptor: new SyncDescriptor(BoonIDEPanelView),
    order: 100
}], boonideViewContainer);
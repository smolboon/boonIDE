/*---------------------------------------------------------------------------------------------
 *  Copyright (c) BoonIDE Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { registerAction2, Action2, MenuId } from '../../../../platform/actions/common/actions.js';
import { CATEGORIES } from '../../../common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { KeyMod, KeyCode } from '../../../../base/common/keyCodes.js';
import './boonidePanel.js';

const BOONIDE_PANEL_VIEW_ID = 'workbench.panel.boonide.view';

// Register command to toggle BoonIDE panel
class ToggleBoonIDEPanelAction extends Action2 {
    static readonly ID = 'workbench.action.toggleBoonIDEPanel';
    static readonly LABEL = localize('toggleBoonIDEPanel', 'Toggle BoonIDE Panel');

    constructor() {
        super({
            id: ToggleBoonIDEPanelAction.ID,
            title: { value: ToggleBoonIDEPanelAction.LABEL, original: 'Toggle BoonIDE Panel' },
            category: CATEGORIES.View,
            keybinding: {
                primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyB,
                weight: KeybindingWeight.WorkbenchContrib
            },
            menu: [{
                id: MenuId.ViewTitle,
                when: undefined,
                group: 'navigation',
                order: 1
            }]
        });
    }

    async run(accessor: ServicesAccessor): Promise<void> {
        const viewsService = accessor.get(IViewsService);
        
        if (viewsService.isViewVisible(BOONIDE_PANEL_VIEW_ID)) {
            viewsService.closeView(BOONIDE_PANEL_VIEW_ID);
        } else {
            viewsService.openView(BOONIDE_PANEL_VIEW_ID, true);
        }
    }
}

// Register Focus BoonIDE Panel action
class FocusBoonIDEPanelAction extends Action2 {
    static readonly ID = 'workbench.action.focusBoonIDEPanel';
    static readonly LABEL = localize('focusBoonIDEPanel', 'Focus BoonIDE Panel');

    constructor() {
        super({
            id: FocusBoonIDEPanelAction.ID,
            title: { value: FocusBoonIDEPanelAction.LABEL, original: 'Focus BoonIDE Panel' },
            category: CATEGORIES.View,
            keybinding: {
                primary: KeyMod.CtrlCmd | KeyCode.KeyB,
                weight: KeybindingWeight.WorkbenchContrib
            }
        });
    }

    async run(accessor: ServicesAccessor): Promise<void> {
        const viewsService = accessor.get(IViewsService);
        viewsService.openView(BOONIDE_PANEL_VIEW_ID, true);
    }
}

// Register BoonIDE Vibecoding Mode action
class SetBoonIDEVibeCodingModeAction extends Action2 {
    static readonly ID = 'boonide.action.setVibeCodingMode';
    static readonly LABEL = localize('setBoonIDEVibeCodingMode', 'Set BoonIDE to Vibecoding Mode');

    constructor() {
        super({
            id: SetBoonIDEVibeCodingModeAction.ID,
            title: { value: SetBoonIDEVibeCodingModeAction.LABEL, original: 'Set BoonIDE to Vibecoding Mode' },
            category: localize('boonide.category', 'BoonIDE'),
            keybinding: {
                primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyV,
                weight: KeybindingWeight.WorkbenchContrib
            }
        });
    }

    async run(accessor: ServicesAccessor): Promise<void> {
        // Implementation would interact with BoonIDE service to set mode
        console.log('Setting BoonIDE to Vibecoding mode');
    }
}

// Register BoonIDE Spec-centric Mode action
class SetBoonIDESpecCentricModeAction extends Action2 {
    static readonly ID = 'boonide.action.setSpecCentricMode';
    static readonly LABEL = localize('setBoonIDESpecCentricMode', 'Set BoonIDE to Spec-centric Mode');

    constructor() {
        super({
            id: SetBoonIDESpecCentricModeAction.ID,
            title: { value: SetBoonIDESpecCentricModeAction.LABEL, original: 'Set BoonIDE to Spec-centric Mode' },
            category: localize('boonide.category', 'BoonIDE'),
            keybinding: {
                primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyS,
                weight: KeybindingWeight.WorkbenchContrib
            }
        });
    }

    async run(accessor: ServicesAccessor): Promise<void> {
        // Implementation would interact with BoonIDE service to set mode
        console.log('Setting BoonIDE to Spec-centric mode');
    }
}

// Register all actions
registerAction2(ToggleBoonIDEPanelAction);
registerAction2(FocusBoonIDEPanelAction);
registerAction2(SetBoonIDEVibeCodingModeAction);
registerAction2(SetBoonIDESpecCentricModeAction);
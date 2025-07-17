/*---------------------------------------------------------------------------------------------
 *  Copyright (c) BoonIDE Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerColor } from '../../platform/theme/common/colorRegistry.js';
import * as nls from '../../nls.js';
import { TERMINAL_BACKGROUND_COLOR } from '../../workbench/contrib/terminal/common/terminalColorRegistry.js';
import { Color } from '../../base/common/color.js';

/**
 * BoonIDE Custom Theme Configuration
 * This file contains custom theme overrides for the BoonIDE configuration.
 */

// Terminal customization
export const TERMINAL_BLACK_BACKGROUND = new Color(new RGBA(0, 0, 0, 1)); // Pure black background
export const HOVER_HIGHLIGHT_COLOR = new Color(new RGBA(147, 69, 109, 0.8)); // #93456d with some transparency for better visibility
export const TEXT_COLOR_WHITE = new Color(new RGBA(248, 248, 248, 1)); // Off-white text color

/**
 * Apply BoonIDE custom theme overrides
 * This function should be called during theme initialization
 */
export function applyBoonIdeTheme(): void {
    // Override terminal background to be pure black
    registerColor('terminal.background', TERMINAL_BLACK_BACKGROUND, nls.localize('terminal.background.override', 'BoonIDE terminal background color (black)'));
    
    // Set hover highlight color to #93456d
    registerColor('editor.hoverHighlightBackground', HOVER_HIGHLIGHT_COLOR, nls.localize('editor.hoverHighlightBackground.override', 'BoonIDE hover highlight color (#93456d)'));
    
    // Set text colors to off-white/white
    registerColor('editor.foreground', TEXT_COLOR_WHITE, nls.localize('editor.foreground.override', 'BoonIDE text color (off-white/white)'));
    registerColor('terminal.foreground', TEXT_COLOR_WHITE, nls.localize('terminal.foreground.override', 'BoonIDE terminal text color (off-white/white)'));
}
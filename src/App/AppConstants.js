/* ------------------------ GENERAL CONSTANTS ------------------------- */
export const KNOB_TO_SLIDER_RATIO = 0.2

/* ------------------------ COLOUR CONSTANTS ------------------------- */
export const ROYAL_BLUE_R = 65;
export const ROYAL_BLUE_G = 105;
export const ROYAL_BLUE_B = 255;
export const LIGHT_RED_R = 255;
export const LIGHT_RED_G = 80;
export const LIGHT_RED_B = 80;
export const COLOUR_R_CHANGE_PER_DEG = Math.abs(ROYAL_BLUE_R - LIGHT_RED_R) / 300;
export const COLOUR_G_CHANGE_PER_DEG = Math.abs(ROYAL_BLUE_G - LIGHT_RED_G) / 300;
export const COLOUR_B_CHANGE_PER_DEG = Math.abs(ROYAL_BLUE_B - LIGHT_RED_B) / 300;

/* ------------------------ TEMPERATURE CONSTANTS ------------------------- */
export const TEMP_CHANGE_PER_DEG = 30 / 300;
export const LOWEST_TEMP_SLIDER = 50;
export const HIGHEST_TEMP_SLIDER = 80;

/* ------------------------ ANGLE CONSTANTS ------------------------- */
export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;
export const ANGLE_OFFSET_DEG = 60; //make starting point 60 degrees below horizontal
export const ANGLE_OFFSET_RAD = Math.PI / 3;
export const BUFF_DEG = 5;
export const BUFF_RAD = BUFF_DEG * DEG_TO_RAD;
export const MAX_DEG = 360;
export const MIN_DEG = 60;
export const MAX_RAD = Math.PI / 3;
export const MIN_RAD = 2 * Math.PI / 3;

/* ------------------------ INITIALISATION CONSTANTS ------------------------- */
export const INIT_TEMP = 72;
export const INIT_DEG = 280;
export const INIT_RAD = - Math.PI / 9;
export const INIT_COL_R = ROYAL_BLUE_R + Math.round(COLOUR_R_CHANGE_PER_DEG * (INIT_DEG - ANGLE_OFFSET_DEG));
export const INIT_COL_G = ROYAL_BLUE_G - Math.round(COLOUR_G_CHANGE_PER_DEG * (INIT_DEG - ANGLE_OFFSET_DEG));
export const INIT_COL_B = ROYAL_BLUE_B - Math.round(COLOUR_B_CHANGE_PER_DEG * (INIT_DEG - ANGLE_OFFSET_DEG));
export const INIT_COL = "rgb(" + INIT_COL_R + ", " + INIT_COL_G + ", " + INIT_COL_B + ")";
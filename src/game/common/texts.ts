import * as Phaser from 'phaser';
import { DataManager } from '../common/data-manager';

export function getText(key: string): string {
    const isDanish: boolean = DataManager.instance.data.languageIsDanish;

    switch (key) {
        case 'DIALOG_OPTION_1':
            return isDanish ? 'Tag det første tilbud' : 'Take the first offer';
        case 'DIALOG_OPTION_2':
            return isDanish ? 'Tag det andet tilbud' : 'Take the second offer';
        case 'DIALOG_OPTION_3':
            return isDanish ? 'Afslå tilbud' : 'Decline the offer';
    }
    return 'XXX-no-text-XXX ';
}
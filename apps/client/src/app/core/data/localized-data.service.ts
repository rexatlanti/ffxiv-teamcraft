import { Injectable } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import * as places from './sources/places.json';
import * as mobs from './sources/mobs.json';
import * as weathers from './sources/weathers.json';
import * as ventures from './sources/ventures.json';
import * as freeCompanyActions from './sources/free-company-actions.json';
import * as jobNames from './sources/job-name.json';
import * as jobAbbrs from './sources/job-abbr.json';
import { Language } from './language';
import { koActions } from './sources/ko-actions';
import { mapIds } from './sources/map-ids';
import { LazyDataService } from './lazy-data.service';

@Injectable()
export class LocalizedDataService {

  indentRegexp = new RegExp('<Indent/>', 'i');

  constructor(private lazyData: LazyDataService) {
  }

  public getItem(id: number): I18nName {
    const zhRow = this.getRow(this.lazyData.zhItems, id);
    const koRow = this.getRow(this.lazyData.koItems, id);
    const row = this.getRow(this.lazyData.items, id);

    if (row !== undefined) {
      // If an item doesn't exist yet inside zh and ko items, use english name instead.
      row.zh = zhRow !== undefined ? zhRow.zh : row.en;
      row.ko = koRow !== undefined ? koRow.ko : row.en;
      row.fr = row.fr.replace(this.indentRegexp, '');
    }
    return row;
  }

  public getItemIdsByName(name: string, language: Language): number[] {
    if (['en', 'fr', 'de', 'ja', 'zh', 'ko'].indexOf(language) === -1) {
      language = 'en';
    }
    const regex = new RegExp(`${name}`, 'i');
    const res = [];
    const keys = Object.keys({ ...this.lazyData.items, ...this.lazyData.zhItems, ...this.lazyData.koItems });
    for (const key of keys) {
      if (regex.test(this.lazyData.items[key][language])) {
        res.push(key);
      }
    }
    // Return a number array with the keys as values, so we have to convert them to numbers.
    return res.map(id => +id);
  }

  public getPlace(id: number): I18nName {
    const row = this.getRow(places, id);
    const koRow = this.getRow(this.lazyData.koPlaces, id);

    if (row !== undefined) {
      row.ko = koRow !== undefined ? koRow.ko : row.en;
    }
    return row;
  }

  public getNpc(id: number): I18nName {
    const row = this.getRow(this.lazyData.npcs, id);
    const koRow = this.getRow(this.lazyData.koNpcs, id);

    if (row !== undefined) {
      row.ko = koRow !== undefined ? koRow.ko : row.en;
    }
    return row;
  }

  public getJobName(id: number): I18nName {
    const row = this.getRow(jobNames, id);
    const koRow = this.getRow(this.lazyData.koJobNames, id);

    if (row !== undefined) {
      row.ko = koRow !== undefined ? koRow.ko : row.en;
    }
    return row;
  }

  public getJobAbbr(id: number): I18nName {
    const row = this.getRow(jobAbbrs, id);
    const koRow = this.getRow(this.lazyData.koJobAbbrs, id);

    if (row !== undefined) {
      row.ko = koRow !== undefined ? koRow.ko : row.en;
    }
    return row;
  }

  public getMob(id: number): I18nName {
    const row = this.getRow(mobs, id);
    const koRow = this.getRow(this.lazyData.koMobs, Math.floor(id % 1000000));

    if (row !== undefined) {
      row.ko = koRow !== undefined ? koRow.ko : row.en;
    }
    return row;
  }

  public getVenture(id: number): I18nName {
    return this.getRow(ventures, id);
  }

  public getWeather(id: number): I18nName {
    const row = this.getRow(weathers, id);
    const koRow = this.getRow(this.lazyData.koWeathers, id);

    if (row !== undefined) {
      row.ko = koRow !== undefined ? koRow.ko : row.en;
    }
    return row;
  }

  public getWeatherId(name: string): number {
    return this.getIndexByName(weathers, name, 'en');
  }

  public getAreaIdByENName(name: string): number {
    return this.getIndexByName(places, name, 'en');
  }

  public getFreeCompanyAction(id: number): I18nName {
    const row = this.getRow(freeCompanyActions, id);
    const koRow = this.getRow(this.lazyData.koFCActions, id);

    if (row !== undefined) {
      row.ko = koRow !== undefined ? koRow.ko : row.en;
    }
    return row;
  }

  public getMapId(name: string): number {
    const result = mapIds.find(map => map.name === name);
    if (result === undefined) {
      return -1;
    }
    return result.id;
  }

  public getCraftingActionIdByName(name: string, language: Language): number {
    if (language === 'ko') {
      const koRow = koActions.find(a => a.ko === name);
      if (koRow !== undefined) {
        name = koRow.en;
        language = 'en';
      }
    }
    let res = this.getIndexByName(this.lazyData.craftActions, name, language);
    if (res === -1) {
      res = this.getIndexByName(this.lazyData.actions, name, language);
    }
    if (res === -1) {
      throw new Error('Data row not found.');
    }
    return res;
  }

  public getCraftingActionByName(name: string, language: Language): I18nName {
    if (language === 'ko') {
      const koRow = koActions.find(a => a.ko === name);
      if (koRow !== undefined) {
        name = koRow.en;
        language = 'en';
      }
    }
    const result = this.getRowByName(this.lazyData.craftActions, name, language) || this.getRowByName(this.lazyData.actions, name, language);
    if (result === undefined) {
      throw new Error('Data row not found.');
    }
    const koResultRow = koActions.find(a => a.en === result.en);
    if (koResultRow !== undefined) {
      result.ko = koResultRow.ko;
    }
    return result;
  }

  public getCraftingAction(id: number): I18nName {
    const result = this.getRow(this.lazyData.craftActions, id) || this.getRow(this.lazyData.actions, id);
    if (result === undefined) {
      throw new Error('Data row not found.');
    }
    const koRow = this.getRow(this.lazyData.koCraftActions, id) || this.getRow(this.lazyData.koActions, id);
    if (koRow !== undefined) {
      result.ko = koRow.ko;
    }
    return result;
  }

  private getRow(array: any, id: number | string): I18nName {
    if (array === undefined) {
      return undefined;
    }
    return array[id];
  }

  /**
   * Specific case for weather, might be usefule for other data.
   * @param array
   * @param name
   * @param language
   * @returns {I18nName}
   */
  private getRowByName(array: any, name: string, language: Language): I18nName {
    const res = this.getIndexByName(array, name, language);
    if (res === -1) {
      return undefined;
    }
    return array[res];
  }

  /**
   * Gets the id of a row by name.
   * @param  array
   * @param {string} name
   * @param language
   * @returns {number}
   */
  private getIndexByName(array: any, name: string, language: string): number {
    if (array === undefined) {
      return -1;
    }
    if (['en', 'fr', 'de', 'ja', 'ko', 'zh'].indexOf(language) === -1) {
      language = 'en';
    }
    let res = -1;
    const keys = Object.keys(array);
    for (const key of keys) {
      if (array[key][language].toLowerCase() === name.toLowerCase()) {
        res = +key;
        break;
      }
    }
    if (['ko', 'zh'].indexOf(language) > -1 && res === -1) {
      return this.getIndexByName(array, name, 'en');
    }
    return res;
  }
}

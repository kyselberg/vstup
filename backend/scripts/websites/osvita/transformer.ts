import * as cheerio from "cheerio";
import { trim } from "../../../utils/strings.js";

export class OsvitaTransformer {
    transform(data: string): { amounts: { totalPlaces: string, contractPlaces: string, budgetPlaces: string }, table: { name: string, priority: string, state: string, marks: string, type: string }[], university: string, speciality: string, programName: string } {
        const amounts = this.transformAmounts(data);
        const table = this.transformTable(data);
        const university = this.transformUniversity(data);
        const speciality = this.transformSpeciality(data);
        const programName = this.transformProgramName(data);

        return { amounts, table, university, speciality, programName };
    }

    transformAmounts(data: string): { totalPlaces: string, contractPlaces: string, budgetPlaces: string } {
        const $ = cheerio.load(data);
        const mainBlock = $('.block-pro-vnz:nth-of-type(4)');

        const totalPlaces = mainBlock.find('.table-of-specs-item b:nth-of-type(1)').text();
        const contractPlaces = mainBlock.find('.table-of-specs-item b:nth-of-type(2)').text();
        const budgetPlaces = mainBlock.find('.table-of-specs-item b:nth-of-type(3)').text();

        return { totalPlaces: trim(totalPlaces), contractPlaces: trim(contractPlaces), budgetPlaces: trim(budgetPlaces) };
    }

    transformTable(data: string): { name: string, priority: string, state: string, marks: string, type: string }[] {
        const $ = cheerio.load(data);
        const table = $('table.rwd-table');
        const tableData = table.find('tr').map((index, element) => {
            const $element = $(element);
            const name = $element.find('[data-th="ПІБ"]').text();
            const priority = $element.find('[data-th="П"]').text();
            const state = $element.find('[data-th="Стан"]').text();
            const marks = $element.find('[data-th="Бал"]').text();
            const type = $element.find('[data-th="Тип"]').text();

            return { name: trim(name), priority: trim(priority), state: trim(state), marks: trim(marks), type: trim(type) };
        }).get();

        return tableData;
    }

    transformUniversity(data: string): string {
        const $ = cheerio.load(data);
        const university = $('.page-vnz-detail-title a').text();
        return trim(university);
    }

    transformSpeciality(data: string): string {
        const $ = cheerio.load(data);
        const speciality = $('.page-vnz-detail-title h1 b:nth-of-type(2)').text();
        return trim(speciality);
    }

    transformProgramName(data: string): string {
        const $ = cheerio.load(data);
        const programName = $('.page-vnz-detail-title h1 b:nth-of-type(1)').text();
        return trim(programName);
    }
}
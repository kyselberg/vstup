import type { ProgramsType } from "../schemas/programs.js";

const positiveStates = ['До наказу (контракт)', 'До наказу (бюджет)', 'Рекомендовано (бюджет)', 'Рекомендовано (контракт)', 'Зареєстровано', 'Допущено'];

const sortByType = (a: { type: string }, b: { type: string }) => {
    if (a.type === 'Б' && b.type === 'К') return -1;
    if (a.type === 'К' && b.type === 'Б') return 1;
    return 0;
}

const sortByMarks = (a: { marks: string }, b: { marks: string }) => {
    return parseFloat(b.marks) - parseFloat(a.marks)
}

const sortByState = (a: { state: string }, b: { state: string }) => {
    const statePriority: Record<string, number> = {
        'До наказу (бюджет)': 5,
        'До наказу (контракт)': 4,
        'Рекомендовано (бюджет)': 3,
        'Рекомендовано (контракт)': 2,
        'Зареєстровано': 1,
        'Допущено': 0,
    };

    const priorityA = statePriority[a.state] ?? -1;
    const priorityB = statePriority[b.state] ?? -1;

    return priorityB - priorityA;
}

const filterByState = (row: { state: string }) => {
    return row.state !== '';
}

const filterAllowed = (row: { state: string }) => {
    return positiveStates.includes(row.state);
}

const filterAllButAllowed = (row: { state: string }) => {
    return !positiveStates.includes(row.state);
}

export const processTable = (program: ProgramsType['programs'][number]) => {
    const budgetPlacesAmount = parseInt(program.amounts.budgetPlaces);

    const students = program.table.filter(filterByState);

    const budgetStudents = students
        .filter(filterAllowed)
        .toSorted(sortByType)
        .slice(0, budgetPlacesAmount);

    const contractStudents = students
        .filter(filterAllowed)
        .toSorted(sortByType)
        .slice(budgetPlacesAmount)
        .toSorted(sortByState)
        .toSorted(sortByMarks);

    const allButAllowed = students
        .filter(filterAllButAllowed)
        .toSorted(sortByType)
        .toSorted(sortByState)
        .toSorted(sortByMarks);

    return [...budgetStudents, ...contractStudents, ...allButAllowed];
}

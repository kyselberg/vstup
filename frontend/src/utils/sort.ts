import type { ProgramsType } from "../schemas/programs.js";

const sortByType = (a: { type: string }, b: { type: string }) => {
    if (a.type === 'Б' && b.type === 'К') return -1;
    if (a.type === 'К' && b.type === 'Б') return 1;
    return 0;
}

const sortByMarks = (a: { marks: string }, b: { marks: string }) => {
    return parseFloat(b.marks) - parseFloat(a.marks)
}

const sortByState = (a: { state: string }, b: { state: string }) => {
    if (a.state === 'Прийнято' && b.state !== 'Прийнято') return -1;
    if (b.state === 'Прийнято' && a.state !== 'Прийнято') return 1;
    return 0;
}

const filterByState = (row: { state: string }) => {
    return row.state !== '';
}

export const processTable = (program: ProgramsType['programs'][number]) => {
    const budgetPlacesAmount = parseInt(program.amounts.budgetPlaces);

    const students = program.table.filter(filterByState);

    const budgetStudents = students
        .toSorted(sortByType)
        .slice(0, budgetPlacesAmount);

    const contractStudents = students
        .toSorted(sortByType)
        .slice(budgetPlacesAmount)
        .toSorted(sortByState)
        .toSorted(sortByMarks);

    return [...budgetStudents, ...contractStudents];
}

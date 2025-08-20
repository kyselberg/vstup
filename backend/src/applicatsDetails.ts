import { queryPrograms } from "./builder.js";

export const getMe = (name: string): boolean => {
    return name === 'Кисельов І. О.';
  };


  type ReturnType = {
    program: string,
    programId: string,
    university: string,
    universityId: string,
  }[]

export const applicantsDetails = async (programId: string): Promise<Record<string, ReturnType>> => {
    const programs = await queryPrograms();
    const selectedProgram = programs.programs.find(program => program.id === programId);

    if (!selectedProgram) {
        throw new Error('Program not found');
    }

    const otherPrograms = programs.programs.filter(program => program.id !== programId);
    const selectedProgramApplicants = selectedProgram.table.map(a => a.name);

    const selectedApplicantsPriorities = selectedProgram.table.reduce((acc, curr) => {
        const priority = Number(curr.priority);

        acc[curr.name] = Number.isNaN(priority) ? Number.NEGATIVE_INFINITY : priority;

        return acc;
    } , {} as Record<string, number>);

    type ApplicantsType = {
        program: string,
        programId: string,
        university: string,
        universityId: string,
        applicant: {
            name: string;
            priority: string;
            state: string;
            marks: string;
            type: string;
        }
    }[];

    const budgetApplicants: ApplicantsType = otherPrograms.flatMap((program) => {
        const budgetApplicants = program.table.slice(0, parseInt(program.amounts.budgetPlaces))

        const applicants = budgetApplicants
            .filter(applicant =>
                selectedProgramApplicants.includes(applicant.name)
                && (Number(applicant.priority) < Number(selectedApplicantsPriorities[applicant.name]))
            );

        return applicants.map(applicant => {
            return {
                program: program.programName,
                programId: program.id,
                universityId: program.universityId,
                university: program.university,
                applicant
            }
        });
    });

    return budgetApplicants.reduce((acc, curr) => {
        acc[curr.applicant.name] ??= [];
        acc[curr.applicant.name]?.push({
            program: curr.program,
            programId: curr.programId,
            university: curr.university,
            universityId: curr.universityId,
        });
        return acc;
    } , {} as Record<string, ReturnType>);
};
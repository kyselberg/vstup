import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { applicants, programs, universities } from '../db/schema.js';
import { processTable } from '../utils/sort.js';

const schema = z.object({
    programs: z.object({
      id: z.string(),
      website: z.string(),
      url: z.string(),
      timestamp: z.string(),
      university: z.string(),
      speciality: z.string(),
      programName: z.string(),
      amounts: z.object({
        totalPlaces: z.string(),
        contractPlaces: z.string(),
        budgetPlaces: z.string()
      }),
      table: z.array(z.object({
        name: z.string(),
        priority: z.string(),
        state: z.string(),
        marks: z.string(),
        type: z.string()
      })),
    }).array()
  });


export type ProgramsType = z.infer<typeof schema>;

export const queryPrograms = async () => {
    const rawPrograms = await db.select().from(programs);
    const rawResults = await db
        .select()
        .from(universities)
        .leftJoin(programs, eq(universities.id, programs.university_id))
        .leftJoin(applicants, eq(programs.id, applicants.program_id)).orderBy(applicants.position);

    const programIds = rawPrograms.map(program => program.id);

    const res: ProgramsType['programs'] = programIds.map((programId) => {
        const program = rawPrograms.find(program => program.id === programId);

        const all = rawResults.find(result => result.programs?.id === programId);

        const table = rawResults.filter(result => result.programs?.id === programId).map(result => ({
            name: result.applicants?.name || '',
            priority: result.applicants?.priority || '',
            state: result.applicants?.status || '',
            marks: result.applicants?.mark?.toString() || '',
            type: result.applicants?.type || '',
        }));

        const result = {
            id: programId,
            website: program?.website || '',
            url: program?.website || '',
            timestamp: new Date().toISOString(),
            university: all?.universities?.name || '',
            speciality: program?.speciality_name || '',
            programName: program?.name || '',
            amounts: {
                totalPlaces: all?.programs?.total?.toString() || '0',
                contractPlaces: all?.programs?.contract?.toString() || '0',
                budgetPlaces: all?.programs?.budget?.toString() || '0'
            },
            table: table as ProgramsType['programs'][number]['table'],
        }

        return {
            ...result,
            table: processTable(result),
        };
    });
    return {
        programs: res
    };
}

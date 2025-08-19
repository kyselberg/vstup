import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.ts';
import { applicants, programs, universities } from '../db/schema.ts';

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


type ParsedResult = z.infer<typeof schema>;

export const queryPrograms = async () => {
    const rawPrograms = await db.select().from(programs);
    const rawResults = await db
        .select()
        .from(universities)
        .leftJoin(programs, eq(universities.id, programs.university_id))
        .leftJoin(applicants, eq(programs.id, applicants.program_id)).orderBy(applicants.position);

    const programIds = rawPrograms.map(program => program.id);

    const res: ParsedResult['programs'] = programIds.map((programId) => {
        const program = rawPrograms.find(program => program.id === programId);
        const result = rawResults.find(result => result.programs?.id === programId);
        return {
            id: programId,
            website: program?.website || '',
            url: program?.website || '',
            timestamp: new Date().toISOString(),
            university: result?.universities?.name || '',
            speciality: program?.speciality_name || '',
            programName: program?.name || '',
            amounts: {
                totalPlaces: result?.programs?.total?.toString() || '0',
                contractPlaces: result?.programs?.contract?.toString() || '0',
                budgetPlaces: result?.programs?.budget?.toString() || '0'
            },
            table: rawResults.filter(result => result.programs?.id === programId).map(result => {
                return {
                    name: result.applicants?.name || '',
                    priority: result.applicants?.priority || '',
                    state: result.applicants?.status || '',
                    marks: result.applicants?.mark?.toString() || '',
                    type: result.applicants?.type || '',
                }
            }),
        }
    });
    return {
        programs: res
    };
}

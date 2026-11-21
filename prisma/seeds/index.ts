import { db } from '@/app/lib/db';

const movies = [
  { title: 'Iron Man', releaseYear: 2008, runtimeMinutes: 126, prerequisites: [] },
  { title: 'Captain America: The First Avenger', releaseYear: 2011, runtimeMinutes: 124, prerequisites: [] },
  { title: 'The Avengers', releaseYear: 2012, runtimeMinutes: 143, prerequisites: ['Iron Man', 'Captain America: The First Avenger'] },
  { title: 'Captain America: Civil War', releaseYear: 2016, runtimeMinutes: 147, prerequisites: ['The Avengers'] },
  { title: 'Thor: Ragnarok', releaseYear: 2017, runtimeMinutes: 130, prerequisites: [] },
  { title: 'Avengers: Infinity War', releaseYear: 2018, runtimeMinutes: 149, prerequisites: ['Captain America: Civil War', 'Thor: Ragnarok'] },
  { title: 'Avengers: Endgame', releaseYear: 2019, runtimeMinutes: 181, prerequisites: ['Avengers: Infinity War'] },
  { title: 'Avengers: Doomsday', releaseYear: 2026, runtimeMinutes: 180, prerequisites: ['Avengers: Endgame'] },
];

async function main() {
  console.log('Seeding database...');
  
  // 1. Create movies first (without prerequisites)
  for (const m of movies) {
    const existing = await db.orm.public.Movie.where({ title: m.title }).first();
    if (!existing) {
      await db.orm.public.Movie.create({
        title: m.title,
        releaseYear: m.releaseYear,
        runtimeMinutes: m.runtimeMinutes,
        watched: false,
        updatedAt: new Date(),
      });
    }
  }

  // 2. Add prerequisites by looking up IDs
  for (const m of movies) {
    if (m.prerequisites.length > 0) {
      const movieRecord = await db.orm.public.Movie.where({ title: m.title }).first();
      if (!movieRecord) continue;

      for (const prereqTitle of m.prerequisites) {
        const prereqRecord = await db.orm.public.Movie.where({ title: prereqTitle }).first();
        if (prereqRecord) {
          const existingEdge = await db.orm.public.MoviePrerequisite.where({
            movieId: movieRecord.id,
            prerequisiteId: prereqRecord.id
          }).first();
          
          if (!existingEdge) {
            await db.orm.public.MoviePrerequisite.create({
              movieId: movieRecord.id,
              prerequisiteId: prereqRecord.id,
            });
          }
        }
      }
    }
  }

  // 3. Create sample cinemas
  const cinemas = [
    { name: 'AMC Prime', bundleSizes: [1, 3, 4] },
    { name: 'Regal Cinemas', bundleSizes: [2, 5] },
    { name: 'Cinemark', bundleSizes: [6, 9, 20] },
  ];

  for (const c of cinemas) {
    const existing = await db.orm.public.Cinema.where({ name: c.name }).first();
    if (!existing) {
      await db.orm.public.Cinema.create({
        name: c.name,
        bundleSizes: c.bundleSizes,
        updatedAt: new Date(),
      });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
import { prisma } from "../lib/prisma";

const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Lats",
  "Biceps",
  "Triceps",
  "Shoulders",
  "Forearms",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Core",
];

type ExerciseSeed = {
  name: string;
  equipment?: string;
  muscles: { name: string; isPrimary: boolean }[];
};

const EXERCISES: ExerciseSeed[] = [
  { name: "Barbell Bench Press", equipment: "Barbell", muscles: [{ name: "Chest", isPrimary: true }, { name: "Triceps", isPrimary: false }, { name: "Shoulders", isPrimary: false }] },
  { name: "Incline Barbell Bench Press", equipment: "Barbell", muscles: [{ name: "Chest", isPrimary: true }, { name: "Shoulders", isPrimary: false }, { name: "Triceps", isPrimary: false }] },
  { name: "Decline Barbell Bench Press", equipment: "Barbell", muscles: [{ name: "Chest", isPrimary: true }, { name: "Triceps", isPrimary: false }] },
  { name: "Dumbbell Bench Press", equipment: "Dumbbell", muscles: [{ name: "Chest", isPrimary: true }, { name: "Triceps", isPrimary: false }, { name: "Shoulders", isPrimary: false }] },
  { name: "Incline Dumbbell Press", equipment: "Dumbbell", muscles: [{ name: "Chest", isPrimary: true }, { name: "Shoulders", isPrimary: false }, { name: "Triceps", isPrimary: false }] },
  { name: "Dumbbell Flyes", equipment: "Dumbbell", muscles: [{ name: "Chest", isPrimary: true }] },
  { name: "Cable Crossover", equipment: "Cable", muscles: [{ name: "Chest", isPrimary: true }] },
  { name: "Pec Deck", equipment: "Machine", muscles: [{ name: "Chest", isPrimary: true }] },
  { name: "Push-Ups", equipment: "Bodyweight", muscles: [{ name: "Chest", isPrimary: true }, { name: "Triceps", isPrimary: false }, { name: "Shoulders", isPrimary: false }, { name: "Core", isPrimary: false }] },
  { name: "Barbell Row", equipment: "Barbell", muscles: [{ name: "Back", isPrimary: true }, { name: "Lats", isPrimary: true }, { name: "Biceps", isPrimary: false }] },
  { name: "Dumbbell Row", equipment: "Dumbbell", muscles: [{ name: "Back", isPrimary: true }, { name: "Lats", isPrimary: true }, { name: "Biceps", isPrimary: false }] },
  { name: "Lat Pulldown", equipment: "Cable", muscles: [{ name: "Lats", isPrimary: true }, { name: "Biceps", isPrimary: false }, { name: "Back", isPrimary: false }] },
  { name: "Pull-Ups", equipment: "Bodyweight", muscles: [{ name: "Lats", isPrimary: true }, { name: "Biceps", isPrimary: false }, { name: "Back", isPrimary: false }] },
  { name: "Chin-Ups", equipment: "Bodyweight", muscles: [{ name: "Lats", isPrimary: true }, { name: "Biceps", isPrimary: true }, { name: "Back", isPrimary: false }] },
  { name: "T-Bar Row", equipment: "Barbell", muscles: [{ name: "Back", isPrimary: true }, { name: "Lats", isPrimary: true }, { name: "Biceps", isPrimary: false }] },
  { name: "Seated Cable Row", equipment: "Cable", muscles: [{ name: "Back", isPrimary: true }, { name: "Lats", isPrimary: true }, { name: "Biceps", isPrimary: false }] },
  { name: "Face Pulls", equipment: "Cable", muscles: [{ name: "Shoulders", isPrimary: true }, { name: "Back", isPrimary: false }] },
  { name: "Barbell Curl", equipment: "Barbell", muscles: [{ name: "Biceps", isPrimary: true }, { name: "Forearms", isPrimary: false }] },
  { name: "Dumbbell Curl", equipment: "Dumbbell", muscles: [{ name: "Biceps", isPrimary: true }, { name: "Forearms", isPrimary: false }] },
  { name: "Hammer Curl", equipment: "Dumbbell", muscles: [{ name: "Biceps", isPrimary: true }, { name: "Forearms", isPrimary: true }] },
  { name: "Preacher Curl", equipment: "Barbell", muscles: [{ name: "Biceps", isPrimary: true }] },
  { name: "Cable Curl", equipment: "Cable", muscles: [{ name: "Biceps", isPrimary: true }] },
  { name: "Tricep Pushdown", equipment: "Cable", muscles: [{ name: "Triceps", isPrimary: true }] },
  { name: "Skull Crushers", equipment: "Barbell", muscles: [{ name: "Triceps", isPrimary: true }] },
  { name: "Overhead Tricep Extension", equipment: "Dumbbell", muscles: [{ name: "Triceps", isPrimary: true }] },
  { name: "Close-Grip Bench Press", equipment: "Barbell", muscles: [{ name: "Triceps", isPrimary: true }, { name: "Chest", isPrimary: false }] },
  { name: "Dips", equipment: "Bodyweight", muscles: [{ name: "Triceps", isPrimary: true }, { name: "Chest", isPrimary: false }, { name: "Shoulders", isPrimary: false }] },
  { name: "Overhead Press", equipment: "Barbell", muscles: [{ name: "Shoulders", isPrimary: true }, { name: "Triceps", isPrimary: false }] },
  { name: "Dumbbell Shoulder Press", equipment: "Dumbbell", muscles: [{ name: "Shoulders", isPrimary: true }, { name: "Triceps", isPrimary: false }] },
  { name: "Lateral Raise", equipment: "Dumbbell", muscles: [{ name: "Shoulders", isPrimary: true }] },
  { name: "Front Raise", equipment: "Dumbbell", muscles: [{ name: "Shoulders", isPrimary: true }] },
  { name: "Reverse Flyes", equipment: "Dumbbell", muscles: [{ name: "Shoulders", isPrimary: true }, { name: "Back", isPrimary: false }] },
  { name: "Cable Lateral Raise", equipment: "Cable", muscles: [{ name: "Shoulders", isPrimary: true }] },
  { name: "Barbell Squat", equipment: "Barbell", muscles: [{ name: "Quads", isPrimary: true }, { name: "Glutes", isPrimary: true }, { name: "Hamstrings", isPrimary: false }, { name: "Core", isPrimary: false }] },
  { name: "Leg Press", equipment: "Machine", muscles: [{ name: "Quads", isPrimary: true }, { name: "Glutes", isPrimary: false }, { name: "Hamstrings", isPrimary: false }] },
  { name: "Leg Extension", equipment: "Machine", muscles: [{ name: "Quads", isPrimary: true }] },
  { name: "Lunges", equipment: "Dumbbell", muscles: [{ name: "Quads", isPrimary: true }, { name: "Glutes", isPrimary: true }, { name: "Hamstrings", isPrimary: false }] },
  { name: "Hack Squat", equipment: "Machine", muscles: [{ name: "Quads", isPrimary: true }, { name: "Glutes", isPrimary: false }] },
  { name: "Romanian Deadlift", equipment: "Barbell", muscles: [{ name: "Hamstrings", isPrimary: true }, { name: "Glutes", isPrimary: true }, { name: "Back", isPrimary: false }] },
  { name: "Leg Curl", equipment: "Machine", muscles: [{ name: "Hamstrings", isPrimary: true }] },
  { name: "Stiff-Leg Deadlift", equipment: "Barbell", muscles: [{ name: "Hamstrings", isPrimary: true }, { name: "Glutes", isPrimary: true }, { name: "Back", isPrimary: false }] },
  { name: "Hip Thrust", equipment: "Barbell", muscles: [{ name: "Glutes", isPrimary: true }, { name: "Hamstrings", isPrimary: false }] },
  { name: "Glute Kickback", equipment: "Cable", muscles: [{ name: "Glutes", isPrimary: true }] },
  { name: "Calf Raise", equipment: "Machine", muscles: [{ name: "Calves", isPrimary: true }] },
  { name: "Seated Calf Raise", equipment: "Machine", muscles: [{ name: "Calves", isPrimary: true }] },
  { name: "Standing Calf Raise", equipment: "Dumbbell", muscles: [{ name: "Calves", isPrimary: true }] },
  { name: "Plank", equipment: "Bodyweight", muscles: [{ name: "Core", isPrimary: true }] },
  { name: "Cable Crunch", equipment: "Cable", muscles: [{ name: "Core", isPrimary: true }] },
  { name: "Hanging Leg Raise", equipment: "Bodyweight", muscles: [{ name: "Core", isPrimary: true }] },
  { name: "Russian Twist", equipment: "Dumbbell", muscles: [{ name: "Core", isPrimary: true }] },
  { name: "Deadlift", equipment: "Barbell", muscles: [{ name: "Back", isPrimary: true }, { name: "Hamstrings", isPrimary: true }, { name: "Glutes", isPrimary: true }, { name: "Core", isPrimary: false }] },
];

async function main() {
  console.log("Seeding muscle groups...");
  const muscleGroupRecords: Record<string, number> = {};
  for (const name of MUSCLE_GROUPS) {
    const mg = await prisma.muscleGroup.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    muscleGroupRecords[name] = mg.id;
  }

  console.log("Seeding exercises and muscle mappings...");
  for (const ex of EXERCISES) {
    let exercise = await prisma.exercise.findFirst({ where: { name: ex.name } });
    if (!exercise) {
      exercise = await prisma.exercise.create({
        data: {
          name: ex.name,
          equipment: ex.equipment ?? null,
          isCustom: false,
          hidden: false,
        },
      });
    }

    for (const m of ex.muscles) {
      const mgId = muscleGroupRecords[m.name];
      if (mgId == null) continue;
      await prisma.exerciseMuscleGroup.upsert({
        where: {
          exerciseId_muscleGroupId: { exerciseId: exercise.id, muscleGroupId: mgId },
        },
        create: { exerciseId: exercise.id, muscleGroupId: mgId, isPrimary: m.isPrimary },
        update: { isPrimary: m.isPrimary },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

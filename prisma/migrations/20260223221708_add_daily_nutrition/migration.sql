-- CreateTable
CREATE TABLE "DailyNutrition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "calories" REAL,
    "proteinGrams" REAL,
    "carbsGrams" REAL,
    "fatGrams" REAL,
    "notes" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyNutrition_date_key" ON "DailyNutrition"("date");

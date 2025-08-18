export default function csvToJSON(csvText) {
  const lines = csvText
    .trim()
    .split("\n")
    .filter((line) => line.trim());
  if (lines.length < 2) {
    console.error("CSV is empty or has no data rows");
    return [];
  }

  const headers = lines[0]
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i]
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((v) => v.trim().replace(/^"|"$/g, ""));
    if (currentLine.length < headers.length) continue;

    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = currentLine[index];
    });

    if (!obj.Question || !obj.CorrectAnswer) {
      console.warn(`Skipping row ${i}: missing Question or CorrectAnswer`);
      continue;
    }

    const options = [obj.Option1, obj.Option2, obj.Option3, obj.Option4].filter(
      Boolean
    );

    if (options.length < 2) {
      console.warn(`Skipping row ${i}: fewer than 2 options`);
      continue;
    }

    result.push({
      question: obj.Question,
      options,
      correctAnswer: obj.CorrectAnswer,
    });
  }

  if (result.length === 0) {
    console.error("No valid quiz data parsed from CSV");
  }

  return result;
}

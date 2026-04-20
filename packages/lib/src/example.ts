export function exampleFunction(input?: string) {
  console.log("Inside shared lib");
  return `Return "${input ?? "nothing"}" from shared lib`;
}

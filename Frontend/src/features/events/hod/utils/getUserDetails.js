export const getTargetAudience = (event) => {
  const audience = event.targetAudience;

  if (!audience || audience.length === 0) {
    return "Not mentioned";
  }

  return audience.join(", ");
};

export const getResourcePersons = (event) => {
  const persons = event.resourcePersons;

  if (!persons || persons.length === 0) {
    return "Not mentioned";
  }

  return persons.join(", ");
};

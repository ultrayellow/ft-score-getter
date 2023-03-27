export const getMonthFromInput = (input: string) => {
  try {
    const parsed = parseInt(input);

    for (let i = 1; i <= 12; i++) {
      if (parsed === i) {
        return parsed - 1;
      }
    }

    throw Error();
  } catch (e) {
    console.error(`month plz, input: ${input}`);
    throw e;
  }
};

export const getPrevMonth = (month: number) => {
  if (month === 0) {
    return 11;
  }

  return month - 1;
};

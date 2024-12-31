export const displayDate = (val: string) => {
	const date = new Date(val);
	const today = new Date();
	const isToday =
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear();

	const formatter = new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});

	return isToday ? "Today" : formatter.format(date);
};

export const getUsername = (email: string) => {
	const emailIndex = email.split('').findIndex(char => char === '@')
	return email.slice(0, emailIndex)
}

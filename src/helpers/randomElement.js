import generateUniqueCode from "./generateCode";

function getRandomElement(array) {
	array = array.map((item) => generateUniqueCode(item));
	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
}

export default getRandomElement;

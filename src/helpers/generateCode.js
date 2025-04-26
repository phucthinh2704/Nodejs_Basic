function generateUniqueCode(str) {
	// Kiểm tra chuỗi rỗng
	if (!str || str.length === 0) {
		return "";
	}

	// Lấy chữ cái đầu tiên và chuyển thành chữ hoa
	const firstChar = str.charAt(0).toUpperCase();

	// Lấy chữ cái cuối cùng và chuyển thành chữ hoa
	const lastChar = str.charAt(str.length - 1).toUpperCase();

	// Lấy độ dài của chuỗi
	const strLength = str.length;

	// Kết hợp lại để tạo mã
	return firstChar + lastChar + strLength;
}

export default generateUniqueCode;

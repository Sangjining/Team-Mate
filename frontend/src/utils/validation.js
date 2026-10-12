// 아이디: 영문 소문자 + 숫자, 4~20자
export const loginIdRegex = /^[a-z0-9]{4,20}$/;

// 비밀번호: 영문 + 숫자 + 특수문자, 8~20자
export const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

// 이름: 한글 또는 영문, 2~20자
export const nameRegex = /^[가-힣a-zA-Z]{2,20}$/;

// 이메일 형식
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
import "@babel/polyfill";
import { User as UserModel } from "../models";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";

export const getUser = async (req, res) => {
	const { user_ids } = req.query;
	console.log(req.query);
	if (!user_ids) {
		return res
			.status(400)
			.json({ isSuccess: false, message: "잘못된 요청입니다." });
	}
	const userIds = user_ids.split(",").map((e) => Number(e));
	if (userIds.length <= 0) {
		return res.json({ isSuccess: true, users: [] });
	}

	try {
		const response = await UserModel.findAll({
			where: {
				id: {
					[Op.in]: userIds,
				},
			},
		});
		return res.json({ isSuccess: true, users: response });
	} catch (error) {
		return res.status(500).json({
			isSuccess: false,
			message: "서버처리 오류",
		});
	}
};

export const getUserById = async (req, res) => {
	const { id } = req.params;
	if (!Number(id)) {
		return res.status(400).json({
			isSuccess: false,
			message: "옳바른 요청값이 아닙니다.",
		});
	}
	try {
		const user = await UserModel.findOne({ where: { id } });
		if (!user) {
			return res.json({
				isSuccess: false,
				message: "요청값에 해당하는 유저정보가 없습니다.",
			});
		} else {
			const {
				id,
				email,
				address1,
				address2,
				nickname,
				profile_image_url,
			} = user.dataValues;
			return res.json({
				isSuccess: true,
				user: { id, email, address1, address2, nickname, profile_image_url },
			});
		}
	} catch (error) {
		return res.status(500).json({
			isSuccess: false,
			message: "서버처리 오류",
		});
	}
};

export const updateUser = async (req, res) => {
	const { id: userId } = req.params;
	const { nickname, address1, address2 } = req.body;
	// 사용자 인증 및 인가
	const token = req.cookies.x_auth;
	if (!token) {
		return res.status(401).json({
			isSuccess: false,
			code: 401,
			message: "전송된 토큰이 없습니다.",
		});
	}
	try {
		const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
		const { id } = decoded;
		if (id !== Number(userId)) {
			console.log(id, userId, typeof id, typeof userId);
			const error = new Error("Forbidden This Resource");
			error.name = "ForbiddenResourceError";
			throw error;
		}
	} catch (error) {
		console.error(error);
		if (error.name === "TokenExpiredError") {
			return json.status(401).json({
				isSuccess: false,
				code: 401,
				message: "토큰이 만료되었습니다.",
			});
		} else if (error.name === "ForbiddenResourceError") {
			return res.status(403).json({
				isSuccess: false,
				code: 403,
				message: "유저정보를 수정할 권한이 없습니다.",
			});
		}
		return res
			.status(401)
			.json({ isAuth: false, code: 401, message: "유효하지 않은 토큰입니다." });
	}

	// 요청처리
	try {
		const profile_image_url = req.file
			? `/${req.file.destination}/${req.file.filename}`
			: undefined;
		await UserModel.update(
			{ nickname, address1, address2, profile_image_url },
			{ where: { id: Number(userId) } }
		);
		return res.json({ isSuccess: true, code: 200 });
	} catch (error) {
		console.error(error);
		return res.json({ isSuccess: false, code: 200 });
	}
};

export const registerUser = async (req, res) => {
	const { email, password, address1, address2, nickname } = req.body;
	if (
		!email ||
		!password ||
		!address1 ||
		!address2 ||
		!nickname ||
		email.trim().length <= 0 ||
		password.trim().length <= 0 ||
		address1.trim().length <= 0 ||
		address2.trim().length <= 0 ||
		nickname.trim().length <= 0
	) {
		return res.status(400).json({
			code: 400,
			joinSuccess: false,
			message: "잘못된 입력입니다. 입력값을 다시 확인해주시길 바랍니다.",
		});
	}
	try {
		await UserModel.create({
			email,
			password,
			address1,
			address2,
			nickname,
		});
		res.json({ joinSuccess: true });
	} catch (error) {
		console.log(error);
		if (error.name === "SequelizeValidationError") {
			return res.status(400).json({
				code: 400,
				joinSuccess: false,
				message: "잘못된 입력입니다. 입력값을 다시 확인해주시길 바랍니다.",
			});
		} else if (error.name === "SequelizeUniqueConstraintError") {
			return res.status(200).json({
				joinSuccess: false,
				message: "이미 가입되어있는 이메일입니다.",
			});
		} else {
			return res
				.status(500)
				.json({ joinSuccess: false, message: "회원가입에 실패하였습니다." });
		}
	}
};

export const isExistUser = async (req, res) => {
	const { email } = req.query;
	try {
		const user = await UserModel.findOne({ where: { email } });
		console.log(user);
		if (!user) {
			return res.json({
				isExistUser: false,
				message: "이메일에 해당하는 유저정보가 없습니다.",
			});
		} else {
			return res.json({
				isExistUser: true,
				message: "이메일에 해당하는 유저정보가 있습니다.",
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 500 });
	}
};

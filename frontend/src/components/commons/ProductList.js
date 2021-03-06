import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

function ProductList(props) {
	if (!props.productArticles) {
		return <></>;
	}

	return (
		<ProductContainer>
			{props.productArticles.map((e, index) => (
				<article key={index} className="product-item">
					<Link to={`/products/${e.id}`} className="product-item_link">
						<div className="product-item__image-card">
							<img
								src={e.productImages[0].fileUrl}
								alt="제품 이미지"
								className="product-item__image"
							/>
						</div>
						<div className="product-item__description">
							<h2 className="product-item__title">{e.title}</h2>
							<div className="product-item__price">{e.price}원</div>
							<div className="product-item__region">
								{e.user.address1} {e.user.address2}
							</div>
							<div className="product-item__counts">
								<span>관심 {e.interestCount}</span>
							</div>
						</div>
					</Link>
				</article>
			))}
		</ProductContainer>
	);
}

const ProductContainer = styled.section`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-around;
	.product-item {
		display: flex;
		flex-direction: column;
		margin-right: 44px;
		margin-bottom: 64px;
	}

	.product-item:nth-child(4n) {
		margin-right: 0;
	}

	.product-item__image-card {
		width: 200px;
		height: 200px;
		overflow: hidden;
		border-radius: 14px;
		.product-item__image {
			width: 100%;
			height: auto;
		}
	}

	.product-item__description {
		margin-top: 13px;
		display: flex;
		flex-direction: column;
		align-items: start;
		width: 200px;
		.product-item__title {
			width: 100%;
			font-size: 16px;
			margin-bottom: 4px;
			letter-spacing: 0.5px;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
		.product-item__price {
			font-size: 15px;
			font-weight: 500;
			margin-bottom: 4px;
			letter-spacing: 0.3px;
		}
		.product-item__region {
			font-size: 13px;
			margin-bottom: 4px;
			letter-spacing: 0.5px;
		}
		.product-item__counts {
			font-size: 13px;
			color: #757575;
			letter-spacing: 0.65px;
		}
	}
`;

export default ProductList;

const PROMOTION_CATALOG = [
  {
    code: 'CBNEW50',
    label: 'Khach moi giam 50.000d',
    type: 'fixed',
    value: 50000,
    minOrderValue: 180000
  },
  {
    code: 'STUDENT10',
    label: 'Sinh vien giam 10%',
    type: 'percent',
    value: 10,
    minOrderValue: 120000,
    maxDiscount: 40000
  },
  {
    code: 'COMBO25',
    label: 'Don combo giam 25.000d',
    type: 'fixed',
    value: 25000,
    minOrderValue: 150000
  }
];

function getPromotionByCode(code = '') {
  const normalizedCode = code.trim().toUpperCase();
  return PROMOTION_CATALOG.find(item => item.code === normalizedCode) || null;
}

function calculateDiscount(subtotal, promoCode = '') {
  const promotion = getPromotionByCode(promoCode);
  if (!promotion) {
    return {
      appliedPromotion: null,
      discountAmount: 0,
      message: promoCode ? 'Ma giam gia khong hop le' : ''
    };
  }

  if (subtotal < promotion.minOrderValue) {
    return {
      appliedPromotion: null,
      discountAmount: 0,
      message: `Don hang toi thieu ${promotion.minOrderValue.toLocaleString('vi-VN')}d moi ap dung duoc ma ${promotion.code}`
    };
  }

  let discountAmount = 0;
  if (promotion.type === 'fixed') {
    discountAmount = promotion.value;
  } else {
    discountAmount = Math.round(subtotal * promotion.value / 100);
    if (promotion.maxDiscount) {
      discountAmount = Math.min(discountAmount, promotion.maxDiscount);
    }
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return {
    appliedPromotion: promotion,
    discountAmount,
    message: `Da ap dung ma ${promotion.code}`
  };
}

module.exports = {
  PROMOTION_CATALOG,
  getPromotionByCode,
  calculateDiscount
};

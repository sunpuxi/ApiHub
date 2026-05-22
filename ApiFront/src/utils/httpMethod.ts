export interface MethodColorStyle {
  bg: string;
  text: string;
  border: string;
}

export const METHOD_COLORS: Record<string, MethodColorStyle> = {
  get:    { bg: 'rgba(82, 196, 26, 0.1)', text: '#52c41a', border: '#b7eb8f' },
  post:   { bg: 'rgba(24, 144, 255, 0.1)', text: '#1890ff', border: '#91d5ff' },
  put:    { bg: 'rgba(250, 173, 20, 0.1)', text: '#faad14', border: '#ffd591' },
  delete: { bg: 'rgba(255, 77, 79, 0.1)', text: '#ff4d4f', border: '#ffa39e' },
  patch:  { bg: 'rgba(114, 46, 209, 0.1)', text: '#722ed1', border: '#d3adf7' },
};

export function getMethodStyle(method: string): MethodColorStyle {
  return METHOD_COLORS[method.toLowerCase()] || { bg: '#f5f5f5', text: '#595959', border: '#d9d9d9' };
}

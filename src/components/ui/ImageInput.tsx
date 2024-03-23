import { FC } from "react";

interface ImageInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const ImageInput: FC<ImageInputProps> = ({ type, accept, ...props }) => {
	return <input type="file" accept="image/*" {...props} />;
};

export default ImageInput;

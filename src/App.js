import React from 'react';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
	const [image] = useImage(
		'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80',
		'anonymous',
		'origin'
	);
	const shapeRef = React.useRef();
	const trRef = React.useRef();

	React.useEffect(() => {
		if (isSelected) {
			// shapeRef.current.cache();
			// we need to attach transformer manually
			trRef.current.setNode(shapeRef.current);
			trRef.current.getLayer().batchDraw();
		}
	}, [isSelected]);

	React.useLayoutEffect(() => {
		shapeRef.current.cache();
	}, [shapeProps, image, isSelected]);

	const handleDragStart = (e) => {
		e.target.setAttrs({
			shadowOffset: {
				x: 30,
				y: 30,
			},
			// scaleX: 1.5,
			// scaleY: 1.5,
		});
	};

	const handleDragEnd = (e) => {
		e.target.to({
			...shapeProps,
			x: e.target.x(),
			y: e.target.y(),
			// duration: 0.5,
			// easing: Konva.Easing.EaseOut,
			// scaleX: 1,
			// scaleY: 1,
		}) &&
			e.target.setAttrs({
				shadowOffset: {
					x: 0,
					y: 0,
				},
			});
	};

	return (
		<React.Fragment>
			<Image
				image={image}
				onClick={onSelect}
				ref={shapeRef}
				filters={[Konva.Filters.Grayscale]}
				blurRadius={10}
				{...shapeProps}
				draggable
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onTransformEnd={(e) => {
					// transformer is changing scale of the node
					// and NOT its width or height
					// but in the store we have only width and height
					// to match the data better we will reset scale on transform end
					const node = shapeRef.current;
					const scaleX = node.scaleX();
					const scaleY = node.scaleY();

					// we will reset it back
					node.scaleX(1);
					node.scaleY(1);
					node.width(Math.max(5, node.width() * scaleX));
					node.height(Math.max(node.height() * scaleY));

					onChange({
						...shapeProps,
						x: node.x(),
						y: node.y(),
						// set minimal value
						width: node.width(),
						height: node.height(),
					});
				}}
			/>
			{isSelected && (
				<Transformer
					ref={trRef}
					boundBoxFunc={(oldBox, newBox) => {
						// limit resize
						if (newBox.width < 5 || newBox.height < 5) {
							return oldBox;
						}
						return newBox;
					}}
				/>
			)}
		</React.Fragment>
	);
};

const initialRectangles = [
	{
		x: 10,
		y: 10,
		width: 100,
		height: 100,
		id: 'rect1',
	},
];

const App = () => {
	const [rectangles, setRectangles] = React.useState(initialRectangles);
	const [selectedId, selectShape] = React.useState(null);

	return (
		<Stage
			width={window.innerWidth}
			height={window.innerHeight}
			onMouseDown={(e) => {
				// deselect when clicked on empty area
				const clickedOnEmpty = e.target === e.target.getStage();
				if (clickedOnEmpty) {
					selectShape(null);
				}
			}}
		>
			<Layer>
				{rectangles.map((rect, i) => {
					return (
						<Rectangle
							key={i}
							shapeProps={rect}
							isSelected={rect.id === selectedId}
							onSelect={() => {
								selectShape(rect.id);
							}}
							onChange={(newAttrs) => {
								const rects = rectangles.slice();
								rects[i] = newAttrs;
								setRectangles(rects);
							}}
						/>
					);
				})}
			</Layer>
		</Stage>
	);
};

export default App;

import { createEffect, createSignal } from "solid-js";
import styles from "./RenamebleTitle.module.css";

type RenableTitleProps = {
	title: string;
	onEdited: (title: string) => void;
};

const MAX_LAYER_NAME_LENGTH = 25;

export const RenamebleTitle = (props: RenableTitleProps) => {
	const [getTitle, setTitle] = createSignal<string>(props.title);
	const [isEditing, setIsEditing] = createSignal<boolean>(false);

	createEffect(() => {
		setTitle(props.title);
	});

	const onTypeTitle = (e: { target: HTMLInputElement }) => {
		setTitle(e.target.value);
	};

	const onStartEditing = (e: MouseEvent) => {
		e.preventDefault();
		setIsEditing(true);
		registerListeners();
	};

	const autoFocus = (el: HTMLInputElement) => {
		queueMicrotask(() => {
			el.focus();
		});
	};

	const onEnterPress = (e: KeyboardEvent) => {
		if (e.key == "Enter") {
			finishEditing();
		}
	};

	const registerListeners = () => {
		window.addEventListener("keydown", onEnterPress);
	};

	const finishEditing = () => {
		const title = getTitle();

		// If has less than 4 character don't confirm
		if (title.length <= 3) {
			return;
		}

		props.onEdited(getTitle());
		setIsEditing(false);
		window.removeEventListener("keydown", onEnterPress);
	};

	const getShortenName = () => {
		const name = getTitle();
		if (name.length > MAX_LAYER_NAME_LENGTH) {
			return name.slice(0, MAX_LAYER_NAME_LENGTH - 3) + "...";
		}
		return name;
	};

	return (
		<>
			{isEditing() ? (
				<input
					name="title"
					ref={autoFocus}
					class={styles.title}
					type="text"
					value={getTitle()}
					onInput={onTypeTitle}
					onBlur={finishEditing}
				/>
			) : (
				<span class={styles.title} onDblClick={onStartEditing}>
					{getShortenName()}
				</span>
			)}
		</>
	);
};

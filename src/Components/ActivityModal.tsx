import { Task } from "@/types";
import { ChangeEvent } from "react";

type Props = {
	inputState: ActivityInput;
	selectedTask: Task;
	onSave: () => void;
	onClose: () => void;
	onChange: <K extends keyof ActivityInput>(
		key: K,
		value: ActivityInput[K]
	) => void;
};

export type ActivityInput = {
	hours: number;
	minutes: number;
	datetime: string;
	utcString: string;
	startTime: string;
	description: string;
};
export type CreateStudyPlanRequest = {
	sp_id?: string;
	username: string;
	datetime: string;
	task_id: string;
	description: string;
	est_dur_min: number;
	status: string;
	start_time: string;
};

export default function ActivityModal(props: Props) {
	const { inputState, selectedTask, onSave, onClose, onChange } = props;

	// console.log("selected", selectedTask.task_id);
	// const [inputState, setInputState] = useState<ActivityInput>({
	// 	hours: 0,
	// 	minutes: 0,
	// 	// localDateTime: new Date().split("T")[0], // default activity on current date
	// 	datetime: new Date(selectedTask.due_date).toISOString().split("T")[0], // default activity on due date
	// 	utcString: "",
	// 	startTime: "",
	// 	description: "",
	// });

	// const {
	// 	hours,
	// 	minutes,
	// 	datetime: localDateTime,
	// 	utcString,
	// 	description,
	// } = inputState;

	// const totalMinutes = hours * 60 + minutes;

	// const handleNumberInput =
	// 	(field: keyof Pick<ActivityInput, "hours" | "minutes">, max?: number) =>
	// 	(e: ChangeEvent<HTMLInputElement>) => {
	// 		let val = parseInt(e.target.value);
	// 		if (isNaN(val) || val < 0) val = 0;
	// 		if (max !== undefined && val > max) val = max;
	// 		setInputState((prev) => ({ ...prev, [field]: val }));
	// 	};

	const handleNumberInput =
		(field: "hours" | "minutes", max?: number) =>
		(e: ChangeEvent<HTMLInputElement>) => {
			let val = parseInt(e.target.value);
			if (isNaN(val) || val < 0) val = 0;
			if (max !== undefined && val > max) val = max;
			onChange(field, val);
		};

	// const handleDateTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
	// 	const value = e.target.value;
	// 	let utc = "";
	// 	if (value) {
	// 		const dateObj = new Date(value);
	// 		utc = dateObj.toISOString();
	// 	}
	// 	setInputState((prev) => ({
	// 		...prev,
	// 		datetime: value,
	// 		utcString: utc,
	// 	}));
	// };

	const handleDateTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		let utc = "";
		if (value) {
			const dateObj = new Date(value);
			utc = dateObj.toISOString();
		}
		onChange("datetime", value);
		onChange("utcString", utc);
	};

	// const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
	// 	setInputState((prev) => ({ ...prev, description: e.target.value }));
	// };
	const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		onChange("description", e.target.value);
	};

	const formatDuration = (minutes: number): string => {
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		return (
			[h > 0 ? `${h}h` : null, m > 0 ? `${m}m` : null]
				.filter(Boolean)
				.join(" ") || "0m"
		);
	};

	// const handleConfirm = () => {
	// 	const { hours, minutes, localDateTime, utcString, startTime, description } =
	// 		inputState;

	// 	const request: CreateStudyPlanRequest = {
	// 		est_dur_min: hours * 60 + minutes,
	// 		localDateTime,
	// 		utcString,
	// 		startTime,
	// 		description,
	// 	};

	// 	console.log(request);

	// 	onClose();
	// };

	// const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
	// 	setInputState((prev) => ({
	// 		...prev,
	// 		startTime: e.target.value,
	// 	}));
	// };
	const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange("startTime", e.target.value + ":00");
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h3>Date and Time To-Do</h3>
					<button onClick={onClose} className="modal-close">
						✖
					</button>
				</div>

				<div className="modal-body">
					<div className="form-group">
						<label>Task:</label>
						<div className="task-info">
							{selectedTask.teacher && selectedTask.subject && (
								<strong>
									{selectedTask.teacher} : {selectedTask.subject}
								</strong>
							)}
							<p>{selectedTask.wtf}</p>
						</div>
					</div>

					<div className="form-group">
						<label>Date *</label>
						<input
							type="date"
							className="form-input"
							value={inputState.datetime}
							onChange={handleDateTimeChange}
						/>
					</div>

					<div className="form-group">
						<label>Start Time *</label>
						<input
							type="time"
							value={inputState.startTime}
							onChange={handleStartTimeChange}
							className="form-input"
						/>
					</div>

					<div className="form-group">
						<label>My Note</label>
						<textarea
							className="modal-note"
							placeholder="Add your notes here..."
							value={inputState.description}
							onChange={handleDescriptionChange}
						/>
					</div>

					<div className="form-group">
						<label>Estimate Duration (Hours)</label>
						<label style={{ marginLeft: 10 }}>
							Hours:{" "}
							<input
								type="number"
								min="0"
								max="23"
								className="form-input"
								value={inputState.hours}
								onChange={handleNumberInput("hours", 23)}
							/>
						</label>
						<label style={{ marginLeft: 10 }}>
							Minutes:{" "}
							<input
								type="number"
								min="0"
								max="59"
								className="form-input"
								value={inputState.minutes}
								onChange={handleNumberInput("minutes", 59)}
							/>
						</label>
						{/* for debug purpose */}
						{/* <p style={{ marginLeft: 10, marginTop: 8 }}>
							Formatted duration:{" "}
							<strong>{formatDuration(totalMinutes)}</strong>
						</p>
						<p>{totalMinutes}</p> */}
					</div>
				</div>

				<div className="modal-footer">
					<button className="modal-cancel-btn" onClick={onClose}>
						Cancel
					</button>
					<button className="modal-save-btn" onClick={onSave}>
						{/* <button className="modal-save-btn" onClick={handleSaveActivityModal}> */}
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
}

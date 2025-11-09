"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Student } from "@/lib/types";
import { StudentListTable } from "./student-list-table";

interface StudentRoomListModalProps {
	isOpen: boolean;
	onClose: () => void;
	roomNumber: number | null;
	students: Student[];
	onEdit?: (student: Student) => void;
	onDelete?: (student: Student) => void;
}

export function StudentRoomListModal({
	isOpen,
	onClose,
	roomNumber,
	students,
	onEdit,
	onDelete,
}: StudentRoomListModalProps) {
	const title = roomNumber ? `${roomNumber}호 학생 목록` : "학생 목록";

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[720px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="mt-4">
					<StudentListTable
						students={students}
						isLoading={false}
						error={null}
						onEdit={onEdit}
						onDelete={onDelete}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}


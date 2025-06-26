import {
    Card as ShadCard,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Task } from '@/types';
import { CirclePlus, MessageSquarePlus } from 'lucide-react';
import { Button } from './ui/button';
import CollapsibleText from '@/materials/CollapsibleText';

export type CardProps = {
    date: string;
    daysOfWeek: string;
    tasks?: Task[];
    onClickOpenNote: (task: Task) => void;
    onClickAddToMyStudyPlan: (task: Task) => void;
};

export default function Card(props: CardProps) {
    const {
        date,
        daysOfWeek,
        tasks,
        onClickOpenNote,
        onClickAddToMyStudyPlan,
    } = props;

    return (
        <ShadCard className="flex gap-0 rounded-2xl bg-[#f9f9f9] p-0">
            <CardHeader className="bg--[#b3d4fc] rounded-2xl rounded-b-none pt-4">
                <CardTitle className="flex justify-between">
                    <p className="text-lg">{date}</p>
                    <p className="text-lg">{daysOfWeek}</p>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 px-2 py-3">
                {tasks && tasks.length > 0 ? (
                    tasks.map((task, index) => (
                        <ShadCard
                            key={index}
                            className="gap-3 bg-white pt-3 pb-2"
                        >
                            <CardHeader className="bg--[#b3d4fc] gap-0 rounded-2xl rounded-b-none px-6 pt-6 pb-3">
                                {task.teacher && task.subject ? (
                                    <CardTitle className="flex justify-between px-0">
                                        <p className="text-lg">
                                            {`${task.teacher}:${task.subject}`}
                                        </p>
                                        <p className="text-lg">
                                            {task.work_type}
                                        </p>
                                    </CardTitle>
                                ) : (
                                    <CardTitle className="flex justify-end px-0">
                                        <p className="text-lg">
                                            {task.work_type}
                                        </p>
                                    </CardTitle>
                                )}
                            </CardHeader>
                            <CardContent className="">
                                {/* <p>{task.wtf}</p> */}
                                <CollapsibleText text={task.wtf} />
                            </CardContent>
                            <CardFooter className="flex justify-between pl-5">
                                <div className="space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => onClickOpenNote(task)}
                                    >
                                        <MessageSquarePlus />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            onClickAddToMyStudyPlan(task)
                                        }
                                    >
                                        <CirclePlus />
                                    </Button>
                                </div>

                                <p>by: {task.created_by_name || 'Unknow'}</p>
                            </CardFooter>
                        </ShadCard>
                    ))
                ) : (
                    <ShadCard className="gap-3 bg-white pt-3 pb-2">
                        <CardHeader className="bg--[#b3d4fc] rounded-2xl py-6">
                            <CardTitle className="flex justify-between p-0">
                                <p>No Task Dued: Yeah!!! Very Happy</p>
                            </CardTitle>
                        </CardHeader>
                    </ShadCard>
                )}
            </CardContent>
        </ShadCard>
    );
}

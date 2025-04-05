"use client"

import { useState } from "react"
import HomeCard from "./HomeCard"
import { useRouter } from "next/navigation"
import MeetingModel from "./MeetingModel"
import { useUser } from "@clerk/nextjs"
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk"
import { toast } from "sonner"
import { Textarea } from "./ui/textarea"
import ReactDatePicker from "react-datepicker"
import { Input } from "./ui/input"


const MeetingTypeList = () => {
    const router = useRouter();
    const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>()
    const { user } = useUser();
    const client = useStreamVideoClient();
    const [values, setValues] = useState({
        dateTIme: new Date(),
        description: '',
        link: ''
    })
    const [callDetails, setCallDetails] = useState<Call>()
    const createMeeting = async () => {
        if (!client || !user) return;

        try {
            if (!values.dateTIme) {
                toast("Please select a date and time")
                return;
            }
            const id = crypto.randomUUID();
            const call = client.call('default', id)

            if (!call) throw new Error('Failed to create call')
            const startsAt = values.dateTIme.toISOString() || new Date(Date.now()).toISOString();
            const description = values.description || 'Instant Meeting';
            await call.getOrCreate({
                data: {
                    starts_at: startsAt,
                    custom: {
                        description
                    }
                }
            })
            setCallDetails(call)
            if (!values.description) {
                router.push(`/meeting/${call.id}`)
            }

            toast("Meeting Created")

        } catch (error) {
            console.log(error);
            toast("Failed to create meeting")
        }
    }

    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`

    return (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <HomeCard
                img="/icons/add-meeting.svg"
                title="New Meeting"
                description="Start an instant meeting"
                handleClick={() => setMeetingState('isInstantMeeting')}
                className='bg-orange-400'
            />
            <HomeCard
                img="/icons/join-meeting.svg"
                title="Join Meeting"
                description="via invitation link"
                className="bg-blue-500"
                handleClick={() => setMeetingState('isJoiningMeeting')}
            />
            <HomeCard
                img="/icons/schedule.svg"
                title="Schedule Meeting"
                description="Plan your meeting"
                className="bg-purple-500"
                handleClick={() => setMeetingState('isScheduleMeeting')}
            />
            <HomeCard
                img="/icons/recordings.svg"
                title="View Recordings"
                description="Meeting Recordings"
                className="bg-yellow-400"
                handleClick={() => router.push('/recordings')}
            />

            {!callDetails ? (
                <MeetingModel
                    isOpen={meetingState === 'isScheduleMeeting'}
                    onClose={() => setMeetingState(undefined)}
                    title="Create Meeting"
                    handleClick={createMeeting}
                >
                    <div className="flex flex-col gap-2.5">
                        <label className="text-base font-normal leading-[22.4px] text-sky-200">
                            Add a description
                        </label>
                        <Textarea
                            className="border-none bg-[#252A41] focus-visible:ring-0 focus-visible:ring-offset-0"
                            onChange={(e) => {
                                setValues({ ...values, description: e.target.value })
                            }
                            }
                        />
                    </div>
                    <div className="flex w-full flex-col gap-2.5">
                        <label className="text-base font-normal leading-[22.4px] text-sky-2">
                            Select Date and Time
                        </label>
                        <ReactDatePicker
                            selected={values.dateTIme}
                            onChange={(date) => setValues({ ...values, dateTIme: date! })}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption="time"
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="w-full rounded bg-dark-3 p-2 focus:outline-none"
                        />
                    </div>
                </MeetingModel>
            ) : (
                <MeetingModel
                    isOpen={meetingState === 'isScheduleMeeting'}
                    onClose={() => setMeetingState(undefined)}
                    title="Meeting Created"
                    className="text-center"
                    handleClick={() => {
                        navigator.clipboard.writeText(meetingLink)
                        toast("Link Copied")
                    }}
                    image="/icons/checked.svg"
                    buttonIcon="/icons/copy.svg"
                    buttonText="Copy Meeting Link"
                />
            )}

            <MeetingModel
                isOpen={meetingState === 'isInstantMeeting'}
                onClose={() => setMeetingState(undefined)}
                title="Start an Instant Meeting"
                className="text-center"
                buttonText="Start Meeting"
                handleClick={createMeeting}
            />

            <MeetingModel
                isOpen={meetingState === 'isJoiningMeeting'}
                onClose={() => setMeetingState(undefined)}
                title="Type The Link Here"
                className="text-center"
                buttonText="Join The Meeting"
                handleClick={()=>router.push(values.link)}
            >
                <Input
                placeholder="Meeting Link"
                className="border-none bg-[#252A41] focus-visible:ring-0  focus-visible:ring-offset-0"
                onChange={(e)=>setValues({...values,link:e.target.value})}
                />
            </MeetingModel>
        </section>
    )
}

export default MeetingTypeList
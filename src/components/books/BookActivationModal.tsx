'use client';

import { useState } from 'react';
import { AppModal } from '@/components/semibase/AppModal';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { activateBooks, type BookActivationInput } from '@/lib/api';

const educationLevels = ['Below SSC', 'SSC', 'HSC 1st', 'HSC 2nd', 'Honours 1st year', 'Honours 2nd year', 'Honours 3rd year', 'Honours 4th year', 'Masters'];

interface BookActivationModalProps {
  open: boolean;
  onClose: () => void;
  onActivated: (activation: BookActivationInput & { approval_status?: number }) => void;
  onMessage: (message: string) => void;
}

export function BookActivationModal({ open, onClose, onActivated, onMessage }: BookActivationModalProps) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<BookActivationInput>({ village: '', wardNo: 0, fatherName: '', occupationType: 'student', institutionName: '', educationLevel: '', educationDetail: '', professionDetail: '' });

  const submit = async () => {
    setBusy(true);
    try {
      await activateBooks(form);
      onActivated({ ...form, approval_status: 1 });
      onClose();
      onMessage('বইঘর সক্রিয় হয়েছে। এখন বই যোগ বা ধার নিতে পারবেন।');
    } catch (error) { onMessage(error instanceof Error ? error.message : 'তথ্য সংরক্ষণ হয়নি'); } finally { setBusy(false); }
  };

  return (
    <AppModal open={open} title="বইঘর সক্রিয় করুন" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>এখন নয়</Button>{step > 0 && <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>পেছনে</Button>}<Button disabled={busy} onClick={() => step < 2 ? setStep((s) => s + 1) : void submit()}>{step < 2 ? 'পরের ধাপ' : busy ? 'সংরক্ষণ হচ্ছে...' : 'সক্রিয় করুন'}</Button></>}>
      <div className="space-y-4">
        {step === 0 && <><p className="text-sm text-muted">আপনার অবস্থান ও পরিচয় দিয়ে বইঘর সক্রিয় করুন।</p><Input value={form.village} onChange={(event) => setForm({ ...form, village: event.target.value })} placeholder="গ্রাম / এলাকা" /><Input type="number" value={form.wardNo || ''} onChange={(event) => setForm({ ...form, wardNo: Number(event.target.value) })} placeholder="ওয়ার্ড নম্বর" /><Input value={form.fatherName} onChange={(event) => setForm({ ...form, fatherName: event.target.value })} placeholder="বাবার নাম" /></>}
        {step === 1 && <div className="grid grid-cols-3 gap-2">{(['student', 'working', 'business'] as const).map((type) => <button key={type} type="button" onClick={() => setForm({ ...form, occupationType: type })} className={form.occupationType === type ? 'rounded-lg border border-brand bg-brand-light p-4 font-bold text-brand' : 'rounded-lg border border-border p-4 text-sm'}>{type === 'student' ? 'শিক্ষার্থী' : type === 'working' ? 'চাকরি' : 'ব্যবসা'}</button>)}</div>}
        {step === 2 && (form.occupationType === 'student' ? <><Input value={form.institutionName} onChange={(event) => setForm({ ...form, institutionName: event.target.value })} placeholder="স্কুল / কলেজ / বিশ্ববিদ্যালয়" /><select value={form.educationLevel} onChange={(event) => setForm({ ...form, educationLevel: event.target.value })} className="h-10 w-full rounded-lg border border-border px-3 text-sm"><option value="">শ্রেণি নির্বাচন করুন</option>{educationLevels.map((level) => <option key={level}>{level}</option>)}</select>{form.educationLevel === 'Below SSC' && <Input value={form.educationDetail} onChange={(event) => setForm({ ...form, educationDetail: event.target.value })} placeholder="কোন শ্রেণি? যেমন: Class 8" />}</> : <Input value={form.professionDetail} onChange={(event) => setForm({ ...form, professionDetail: event.target.value })} placeholder={form.occupationType === 'business' ? 'ব্যবসার ধরন' : 'পেশা'} />)}
      </div>
    </AppModal>
  );
}
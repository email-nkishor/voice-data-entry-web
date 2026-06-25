import {
  deriveStudentStatus,
  extractCustomFieldValues,
  formatStudentCode,
  parseCustomData,
  studentFromFormValues,
  studentToFormValues,
} from './student.model';

describe('student.model', () => {
  it('formatStudentCode pads id to 7 digits', () => {
    expect(formatStudentCode(42)).toBe('STU0000042');
    expect(formatStudentCode(1234567)).toBe('STU1234567');
  });

  it('deriveStudentStatus uses explicit status when set', () => {
    expect(
      deriveStudentStatus({
        name: 'A',
        class: '',
        rollNo: '1',
        mobile: '',
        address: '',
        createdDate: '',
        status: 'on_leave',
      })
    ).toBe('on_leave');
  });

  it('deriveStudentStatus returns pending_docs without mobile', () => {
    expect(
      deriveStudentStatus({
        name: 'A',
        class: '10',
        rollNo: '1',
        mobile: '',
        address: '',
        createdDate: '',
      })
    ).toBe('pending_docs');
  });

  it('deriveStudentStatus returns new_admission without class', () => {
    expect(
      deriveStudentStatus({
        name: 'A',
        class: '',
        rollNo: '1',
        mobile: '9999999999',
        address: '',
        createdDate: '',
      })
    ).toBe('new_admission');
  });

  it('deriveStudentStatus returns active when core fields present', () => {
    expect(
      deriveStudentStatus({
        name: 'A',
        class: '10',
        rollNo: '1',
        mobile: '9999999999',
        address: 'Noida',
        createdDate: '',
      })
    ).toBe('active');
  });

  it('studentFromFormValues maps form keys to student record', () => {
    const student = studentFromFormValues({
      name: 'Rahul',
      class: 'MCA',
      rollNo: '101',
      mobile: '9876543210',
      address: 'Noida',
    });
    expect(student.name).toBe('Rahul');
    expect(student.class).toBe('MCA');
    expect(student.rollNo).toBe('101');
    expect(student.status).toBe('new_admission');
  });

  it('studentToFormValues maps core columns only', () => {
    const values = studentToFormValues(
      {
        id: 1,
        name: 'Rahul',
        class: 'MCA',
        rollNo: '101',
        mobile: '9876543210',
        address: 'Noida',
        createdDate: '2026-01-01',
      },
      [{ columnKey: 'name' }, { columnKey: 'rollNo' }, { columnKey: 'customField1' }],
      { customField1: 'value' }
    );
    expect(values['name']).toBe('Rahul');
    expect(values['rollNo']).toBe('101');
    expect(values['customField1']).toBe('value');
  });

  it('extractCustomFieldValues separates custom keys', () => {
    const custom = extractCustomFieldValues({
      name: 'Rahul',
      rollNo: '1',
      bloodGroup: 'O+',
    });
    expect(custom).toEqual({ bloodGroup: 'O+' });
  });

  it('parseCustomData returns empty object for invalid json', () => {
    expect(parseCustomData(undefined)).toEqual({});
    expect(parseCustomData('not-json')).toEqual({});
    expect(parseCustomData('{"a":"1"}')).toEqual({ a: '1' });
  });
});

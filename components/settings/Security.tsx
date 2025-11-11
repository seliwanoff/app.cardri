'use client';

import { ArrowLeft, Lock, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import OTPInput from 'react-otp-input';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '../ui/button';
import { FaSpinner } from 'react-icons/fa';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
type FormValues = {
  password: string;
  password2: string;
};
const Security = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      password: '',
      password2: '',
    },
  });
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [eye1, setEye1] = useState(false);
  const [eye2, setEye2] = useState(false);
  const [password, setPassword] = useState('');

  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
    lowercase: false,
  });

  const handleChange = (e: any) => {
    setPassword(e.target.value); // Local state update
    register('password').onChange(e); // react-hook-form's onChange
  };
  const ValidationIndicator = ({ valid, text }: any) => (
    <div
      className={cn(
        'flex items-center text-sm p-2 w-fit rounded-[100px]  text-nowrap',
        valid ? 'bg-[#1BB4461A]' : 'bg-white'
      )}
    >
      <span className={valid ? '#474256' : 'text-[#B4ACCA]'}>{text}</span>
    </div>
  );

  const handleToggle1 = () => {
    setEye1((prev: boolean) => !prev);
  };
  const handleToggle2 = () => {
    setEye2((prev: boolean) => !prev);
  };

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const toastId = toast.loading('Registering...');
    if (isSubmitting) return;
    // console.log(data);

    try {
      const userDatas = {
        password: data.password,
      };
      //@ts-ignore
      const response = await registerUser(userDatas);

      //console.log(response);
      //@ts-ignore

      //@ts-ignore

      toast.success(
        'Registration sucessfully. Verification has been sent to you email',
        { id: toastId }
      );
    } catch (error) {
      console.log(error);

      toast.error(
        //@ts-ignore
        error?.response?.data.message || 'Unable to register users. try again.',
        { id: toastId }
      );
    } finally {
      // setIsLoading(false);
    }

    //await registerUser()
  };
  const ConfirmDrawer = () => {
    // console.log(beneficiaryDetalis);

    return (
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent className='mx-auto max-w-[500px] bg-[#FAF7FF] rounded-tl-[24px] rounded-tr-[24px] border-0 focus-visible:outline-none'>
          {/* Header */}
          <DrawerHeader className='relative bg-main-100 p-6 text-left text-white'>
            <div className='mx-auto w-full max-w-[500px]'>
              <DrawerTitle className='text-xl font-bold text-text-secondary-200 text-[20px] font-sora text-center'>
                Change Password
              </DrawerTitle>
              <DrawerDescription className='text-[#464646] font-normal text-base font-inter text-center mt-3'>
                Update to a new password
              </DrawerDescription>
            </div>
          </DrawerHeader>

          {/* Body Content */}
          <div className='mx-auto w-full max-w-[614px] p-6'>
            <div className='w-full'>
              <form
                id='sign-up'
                className=' [&>label]:block flex flex-col gap-6'
                onSubmit={handleSubmit(onSubmit)}
              >
                <Label htmlFor='password'>
                  <span className='inline-block text-base font-extralight text-[#4F4F4F]'>
                    Current password
                  </span>
                  <div className='relative'>
                    <Input
                      type={eye1 ? 'text' : 'password'}
                      id='password'
                      {...register('password', {
                        required: 'Password is required',
                        validate: () =>
                          Object.values(validations).every(Boolean) ||
                          'Missing requirements',
                      })}
                      onChange={handleChange}
                      placeholder='Create password'
                      className='h-[60px] mt-4 py-[15px] px-[16px] rounded-[10px] border-0 outline-0 bg-white placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100 focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal'
                    />

                    <span
                      className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#828282]'
                      onClick={handleToggle1}
                    >
                      {!eye1 ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                    </span>
                  </div>
                  {errors.password && (
                    <span className='mt-2 text-red-600'>
                      {errors.password.message}
                    </span>
                  )}
                </Label>
                <Label htmlFor='password'>
                  <span className='inline-block text-base font-extralight text-[#4F4F4F]'>
                    Password
                  </span>
                  <div className='relative'>
                    <Input
                      type={eye1 ? 'text' : 'password'}
                      id='password'
                      {...register('password', {
                        required: 'Password is required',
                        validate: () =>
                          Object.values(validations).every(Boolean) ||
                          'Missing requirements',
                      })}
                      onChange={handleChange}
                      placeholder='Create password'
                      className='h-[60px] mt-4 py-[15px] px-[16px] rounded-[10px] border-0 outline-0 bg-white placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100 focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal'
                    />

                    <span
                      className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#828282]'
                      onClick={handleToggle1}
                    >
                      {!eye1 ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                    </span>
                  </div>
                  {errors.password && (
                    <span className='mt-2 text-red-600'>
                      {errors.password.message}
                    </span>
                  )}
                </Label>
                <Label htmlFor='password'>
                  <span className='inline-block text-base font-extralight text-[#4F4F4F]'>
                    Confirm Password
                  </span>
                  <div className='relative mb-4'>
                    <Input
                      type={eye2 ? 'text' : 'password'}
                      id='password2'
                      {...register('password2', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === watch('password') ||
                          'Passwords do not match',
                      })}
                      placeholder='Re-type password'
                      className='h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#fff] placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal'
                      {...register('password2', {
                        required: 'Confirm password is required',
                      })}
                    />
                    <span
                      className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#828282]'
                      onClick={handleToggle2}
                    >
                      {!eye2 ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                    </span>
                  </div>
                  {errors.password2 && (
                    <span className='mt-4 text-red-600'>
                      {errors.password2.message}
                    </span>
                  )}
                </Label>

                <div className='mt-2 grid grid-cols grid-cols-3 gap-3   w-full mx-auto'>
                  <ValidationIndicator
                    valid={validations.length}
                    text='8 characters in length'
                  />
                  <ValidationIndicator
                    valid={validations.uppercase}
                    text='Uppercase letter'
                  />
                  <ValidationIndicator
                    valid={validations.number}
                    text='Number'
                  />

                  <ValidationIndicator
                    valid={validations.lowercase}
                    text='Lowercase letter'
                  />
                  <ValidationIndicator
                    valid={validations.specialChar}
                    text='Special character'
                  />
                </div>

                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full rounded-xl cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center'
                >
                  {isSubmitting ? (
                    <FaSpinner className='animate-spin text-white' />
                  ) : (
                    `Continue`
                  )}
                </Button>
              </form>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <>
      <div className='max-w-5xl mx-auto bg-white rounded-2xl lg:p-6 p-3 mb-4'>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-[#242E3E] font-bold mb-6 font-sora'
        >
          <ArrowLeft size={18} />{' '}
          <span className='font-bold text-xl'>Securtiy</span>
        </button>

        <div className='w-full flex flex-col gap-6 mt-2'>
          <span className='text-[#242E3E] text-xl font-normal font-sora'>
            Password
          </span>

          <div className='border border-[#F4F0FF] rounded-2xl lg:p-6 p-2 flex items-center justify-between flex-col gap-10'>
            <div className='flex w-full max-w-[484px] mx-auto'>
              <Label htmlFor='password ' className='w-full '>
                <span className='inline-block text-sm font-normal text-[#242E3E] font-inter'>
                  Old Password
                </span>
                <div className='relative'>
                  <Input
                    type={'password'}
                    id='password'
                    placeholder='************'
                    disabled
                    className='h-[60px] mt-4 py-[15px] px-[16px] rounded-[10px] border-0 outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100 focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal'
                  />

                  <span
                    className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#FAF7FF]'
                    // onClick={handleToggle1}
                  >
                    {<FiEye size={20} />}
                  </span>
                </div>
              </Label>
            </div>

            <div className='w-full max-w-[484px] mx-auto'>
              <div
                className='flex items-center justify-center cursor-pointer gap-2 text-[#D70D4A] font-bold text-center font-[Helvetica] text-base'
                onClick={() => setOpenDrawer(true)}
              >
                <Lock size={20} />

                <span>Change Password</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-5xl mx-auto bg-white rounded-2xl lg:p-6 p-3 mb-4'>
        <div className='w-full flex flex-col gap-6 mt-2'>
          <span className='text-[#242E3E] text-xl font-normal font-sora'>
            PIN
          </span>

          <div className='border border-[#F4F0FF] rounded-2xl lg:p-6 p-2 flex items-center justify-between flex-col gap-10'>
            <div className='flex w-full max-w-[300px] mx-auto'>
              <Label
                htmlFor='password '
                className='w-full  flex flex-col gap-4'
              >
                <span className='inline-block text-sm font-normal text-[#242E3E] font-inter'>
                  PIN
                </span>
                <div className='mx-auto flex justify-center md:max-w-[300px] w-full'>
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={4}
                    inputType='number'
                    shouldAutoFocus
                    inputStyle={cn(
                      'w-[100%_!important] text-black font-bold font-sora text-[20px] rounded border border-[#E7E7E7] caret-main-100 h-[60px] bg-white outline-0 focus:border focus:border-primary-100 focus:border-opacity-55 focus:bg-[#F5F8FF]'
                    )}
                    containerStyle={{
                      width: '100%',
                      display: 'grid',
                      columnGap: '10px',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                    }}
                    renderInput={(inputProps, index) => (
                      <input
                        {...inputProps}
                        type='text'
                        inputMode='numeric'
                        onKeyDown={(e) => {
                          if (
                            !/[0-9]/.test(e.key) &&
                            e.key !== 'Backspace' &&
                            e.key !== 'Delete' &&
                            e.key !== 'ArrowLeft' &&
                            e.key !== 'ArrowRight'
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          const pastedData =
                            e.clipboardData.getData('text/plain');
                          if (!/^\d+$/.test(pastedData)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    )}
                  />
                </div>
              </Label>
            </div>

            <div className='w-full max-w-[484px] mx-auto'>
              <div className='flex items-center justify-center cursor-pointer gap-2 text-[#D70D4A] font-bold text-center font-[Helvetica] text-base'>
                <Lock size={20} />

                <span>Change PIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDrawer />
    </>
  );
};

export default Security;

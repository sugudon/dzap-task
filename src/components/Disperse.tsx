import React, { useEffect, useRef, useState } from 'react';

import useAutosizeTextArea from './useAutosizeTextArea';

interface InputProps {
  labelText: string;
}

const Disperse: React.FC<InputProps> = ({ labelText }) => {
  const [value, setValue] = useState<string>('');
  const [numberOfNumbers, setNumberOfNumbers] = useState<number>(1);
  const [displayErros, setErros] = useState<string[]>([]);
  const [showOption, setShowOption] = useState<boolean>(false);
  const [showSample, setShowSample] = useState<boolean>(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textLineNoref = useRef<HTMLDivElement>(null);

  useAutosizeTextArea(textAreaRef.current, value);

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;
    setValue(val);
  };

  const addMoreNumbers = (noNo: number) => {
    if (textLineNoref?.current) {
      const lines = value?.split('\n');
      const runTolen = lines ? lines.length : noNo;
      let html = '';
      for (let i = 1; i <= runTolen; i++) {
        html += `<div class='number'>${i}</div>`;
      }
      setNumberOfNumbers(noNo + 1);
      textLineNoref.current.innerHTML = html;
    }
  };

  const initEventListeners = () => {
    if (textLineNoref.current && textAreaRef.current) {
      textLineNoref.current.style.transform = `translateY(-${textAreaRef.current.scrollTop}px)`;
      addMoreNumbers(numberOfNumbers);
    }
  };

  useEffect(() => {
    initEventListeners();
  }, [value]);

  const splitLength = (str: string, opt: string) => str.split(opt);

  const onSubmitHandle = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const lines = value?.split('\n');
    const erros: string[] = [];

    lines.forEach((dt, i) => {
      if (dt) {
        let splittedDtSpace = splitLength(dt, ' ');
        let splittedDtEqual = splitLength(dt, '=');
        let splittedDtComma = splitLength(dt, ',');

        // Check for Invalid address and amount
        if (
          (splittedDtSpace.length > 1 && splittedDtSpace[0].length !== 42) ||
          (splittedDtEqual.length > 1 && splittedDtEqual[0].length !== 42) ||
          (splittedDtComma.length > 1 && splittedDtComma[0].length !== 42)
        ) {
          erros.push(`Line ${i + 1} invalid Ethereum address and wrong amount`);
        }

        if (dt.slice(0, 2) !== '0x') {
          erros.push(`Line ${i + 1} invalid Ethereum address`);
        }

        // Check for Invalid amount
        if (
          (splittedDtSpace.length > 1 && isNaN(Number(splittedDtSpace[1]))) ||
          (splittedDtEqual.length > 1 && isNaN(Number(splittedDtEqual[1]))) ||
          (splittedDtComma.length > 1 && isNaN(Number(splittedDtComma[1])))
        ) {
          erros.push(`Line ${i + 1} wrong amount`);
        }

        // Duplicate Val check
        let lineNosArr: number[] = [];
        lines.reduce(function (a, e, i) {
          if (e === dt) {
            lineNosArr.push(i + 1);
          }
          return a;
        }, []);

        if (lineNosArr.length > 1) {
          setShowOption(true);
          let showAddr = '';
          if (splittedDtSpace.length > 0 && splittedDtSpace[0]) {
            showAddr = splittedDtSpace[0];
          }
          if (splittedDtEqual.length > 0 && splittedDtEqual[0]) {
            showAddr = splittedDtEqual[0];
          }
          if (splittedDtComma.length > 0 && splittedDtComma[0]) {
            showAddr = splittedDtComma[0];
          }
          let duErr = ` ${showAddr}  duplicate in  Line: ${lineNosArr.join(
            ','
          )}`;
          if (!erros.includes(duErr)) {
            erros.push(duErr);
          }
        } else {
          setShowOption(false);
        }
      }
    });

    setErros(erros);
  };

  const keepFirstOne = () => {
    const lines = value?.split('\n');

    let keepFirstOne = lines.filter((c, index) => {
      return lines.indexOf(c) === index;
    });

    setValue(keepFirstOne?.join('\n'));
  };

  const combineBalance = () => {
    const lines = value?.split('\n');
    let newList: string[] = [];
    lines.forEach((dt, i) => {
      if (dt) {
        let lineNosArr: number = 0;
        let cobineBy: string = '';
        let prefixAddr: string = '';
        lines.reduce(function (a, e, i) {
          if (e === dt) {
            let splittedDtSpace = splitLength(dt, ' ');
            let splittedDtEqual = splitLength(dt, '=');
            let splittedDtComma = splitLength(dt, ',');
            if (
              splittedDtSpace.length > 1 &&
              splittedDtSpace[0] &&
              !isNaN(Number(splittedDtSpace[1]))
            ) {
              cobineBy = ' ';
              lineNosArr += Number(splittedDtSpace[1]);
              prefixAddr = splittedDtSpace[0];
            }
            if (
              splittedDtEqual.length > 1 &&
              splittedDtEqual[0] &&
              !isNaN(Number(splittedDtEqual[1]))
            ) {
              cobineBy = '=';
              lineNosArr += Number(splittedDtEqual[1]);
              prefixAddr = splittedDtEqual[0];
            }
            if (
              splittedDtComma.length > 1 &&
              splittedDtComma[0] &&
              !isNaN(Number(splittedDtComma[1]))
            ) {
              cobineBy = ',';
              lineNosArr += Number(splittedDtComma[1]);
              prefixAddr = splittedDtComma[0];
            }
          }
          return a;
        }, []);
        newList.push(`${prefixAddr}${cobineBy}${lineNosArr}`);
      }
    });

    let keepFirstOne = newList.filter((c, index) => {
      return newList.indexOf(c) === index;
    });

    setValue(keepFirstOne?.join('\n'));
  };

  return (
    <>
      <form onSubmit={onSubmitHandle}>
        <label
          htmlFor='message'
          className='block ml-4 text-sm font-normal text-white'
        >
          {labelText}
          <span className='text-gray-400 dark:text-white float-right'>
            Upload File
          </span>
        </label>

        <div className='custom-textarea mt-4 mb-4'>
          <textarea
            ref={textAreaRef}
            rows={4}
            className='textarea block bg-black text-white p-2.5 pl-6 w-full text-sm rounded-lg'
            onChange={e => handleChange(e)}
            value={value}
          />

          <div ref={textLineNoref} className='linenumbers p-3.5'></div>
        </div>

        <span className='text-white ml-4 dark:text-white'>
          Separated by ',' or '' or '='
        </span>
        <button
          onClick={() => setShowSample(true)}
          className='text-gray-400 dark:text-white float-right'
        >
          Show Example
        </button>

        {showOption ? (
          <div className='grid grid-cols-4 gap-4 mt-6'>
            <div>
              <span className='text-white'>Duplicated</span>
            </div>
            <div></div>
            <div></div>
            <div className='col-start-2 col-end-4'>
              <button
                onClick={keepFirstOne}
                className='border-none text-red-700 float-right'
              >
                Keep the first one
              </button>
            </div>
            <div className='border-l-2 border-red-700 px-4'>
              <button
                onClick={combineBalance}
                className='border-none text-red-700'
              >
                Combine Balance
              </button>
            </div>
          </div>
        ) : (
          ''
        )}

        <div className='grid px-4'>
          {displayErros.length ? (
            <div
              className=' mt-6 bg-none border border-red-700 text-red-700 px-4 py-3 rounded relative'
              role='alert'
            >
              <div className='flex'>
                <div className='py-1'>
                  <svg
                    className='fill-current h-6 w-6 text-red-700 mr-4'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                  >
                    <path d='M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z' />
                  </svg>
                </div>
                <div>
                  {displayErros.map((err, index) => (
                    <>
                      <span key={index} className='block sm:inline'>
                        {err}
                      </span>{' '}
                      <br />
                    </>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>

        <button
          type='submit'
          className='mt-10 px-6 py-2 text-purple-100 w-full rounded-full bg-gradient-to-r from-purple-400 to-blue-500'
        >
          Next
        </button>
      </form>

      {showSample ? (
        <>
          <div className='justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none'>
            <div className='relative w-auto my-6 mx-auto max-w-3xl'>
              {/*content*/}
              <div className='border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none'>
                {/*header*/}
                <div className='flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t'>
                  <h3 className='text-3xl font-semibold'>Sample Data</h3>
                  <button
                    className='p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none'
                    onClick={() => setShowSample(false)}
                  >
                    <span className='bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none'>
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className='relative p-6 flex-auto'>
                  <p>
                    0x2CB99F193549681e06C6770dDD5543812B4FaFE8=1
                    0x8B3392483BA26D65E331dB86D4F430E9B3814E5e 50
                    0xEb0D38c92deB969b689acA94D962A07515CC5204=2
                    0xF4aDE8368DDd835B70b625CF7E3E1Bc5791D18C1=10
                    0x09ae5A64465c18718a46b3aD946270BD3E5e6aaB,13
                    0x2CB99F193549681e06C6770dDD5543812B4FaFE8=1
                    0x8B3392483BA26D65E331dB86D4F430E9B3814E5e 50
                    0x09ae5A64465c18718a46b3aD946270BD3E5e6aaB,13
                    0x2CB99F193549681e06C6770dDD5543812B4FaFE8=1
                  </p>
                </div>
                {/*footer*/}
                <div className='flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b'>
                  <button
                    className='text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                    type='button'
                    onClick={() => setShowSample(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='opacity-25 fixed inset-0 z-40 bg-black'></div>
        </>
      ) : null}
    </>
  );
};

export default Disperse;

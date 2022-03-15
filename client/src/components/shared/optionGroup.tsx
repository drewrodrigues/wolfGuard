import classNames from 'classnames'
import React from 'react'

interface ButtonGroupProps<T> {
  value: T
  options: T[]
  onUpdate: (newSet: T | undefined) => void
}

export function OptionGroup<T>({
  value,
  options,
  onUpdate
}: ButtonGroupProps<T>) {
  return (
    <>
      {options.map((option) => {
        const isSelected = value === option

        return (
          <button
            className={classNames(
              'text-white rounded-[5px] px-[7px] mr-[5px]',
              {
                'bg-green-400': isSelected,
                'bg-gray-400': !isSelected
              }
            )}
            key={option as unknown as string}
            onClick={() => {
              if (isSelected) {
                onUpdate(undefined)
              } else {
                onUpdate(option)
              }
            }}
          >
            {option}
          </button>
        )
      })}
    </>
  )
}

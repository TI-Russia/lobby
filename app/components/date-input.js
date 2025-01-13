"use client";

import { useState, useRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ru from "date-fns/locale/ru";
import styles from "./date-input.module.scss";

registerLocale("ru", ru);

export function DateInput({
  name,
  value,
  onChange,
  className,
  minDate,
  maxDate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef();

  const handleChange = (date) => {
    setIsOpen(false);
    const formattedDate = date ? date.toISOString() : "";
    onChange?.(formattedDate);
  };

  return (
    <div className={styles.dateInputWrapper}>
      <DatePicker
        ref={datePickerRef}
        selected={value ? new Date(value) : null}
        onChange={handleChange}
        locale="ru"
        dateFormat="dd.MM.yyyy"
        className={className}
        placeholderText="Выберите дату"
        name={name}
        autoComplete="off"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        open={isOpen}
        onClickOutside={() => setIsOpen(false)}
        onInputClick={() => setIsOpen(true)}
        minDate={minDate}
        maxDate={maxDate}
        customInput={<input className={className} />}
      />
    </div>
  );
}

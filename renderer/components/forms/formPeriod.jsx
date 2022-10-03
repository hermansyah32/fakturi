import React, { useState, useEffect, useRef } from "react";
import StaticCard from "../cards/staticCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const dayjs = require("dayjs");

const {
  setDate,
  getDate,
  setMonth,
  getMonth,
  setYear,
  getYear,
} = require("../../context/globalGenerate");

const currentDate = dayjs(getDate(), "YYYY/MM/DD").isValid()
  ? dayjs(getDate(), "YYYY/MM/DD").toDate()
  : new Date();

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const getYears = () => {
  const years = [];
  const currentYear = dayjs().year();
  for (let year = currentYear; year >= currentYear - 15; year--) {
    years.push(year);
  }
  return years;
};

const FormPeriod = () => {
  const [datePick, setDatePick] = useState(currentDate);
  const [monthPick, setMonthPick] = useState(getMonth());
  const [yearPick, setYearPick] = useState(getYear());

  const monthPickRef = useRef();

  const isFuture = (month, year) => {
    let reportDate = dayjs()
      .set("month", month)
      .set("year", year)
      .endOf("month");

    if (reportDate.isAfter(new Date())) {
      const today = dayjs();
      if (
        today.month() == reportDate.month() &&
        today.year() == reportDate.year()
      )
        return "today";
      else return true;
    }
    return false;
  };

  const onMonthChangeListener = (_month) => {
    if (isFuture(_month, getYear()) !== true) {
      setMonth(_month);
      setMonthPick(_month);
    } else {
      alert("Masa pelaporan pajak tidak boleh untuk masa yang akan datang");
      setMonthPick(getMonth());
      monthPickRef.current.value = getMonth();
    }
  };

  const onYearChangeListener = (_year) => {
    if (isFuture(getMonth(), _year) !== true) {
      setYear(_year);
      setYearPick(_year);
    } else {
      setYearPick(getYear());
    }
  };

  const onDateChangeListener = (date) => {
    setDatePick(date);
    setDate(date);
  };

  useEffect(() => {
    setDate(dayjs(datePick).format("YYYY/MM/DD"));
  }, [datePick]);

  useEffect(() => {
    const checkFuture = isFuture(monthPick, yearPick);

    if (checkFuture === "today") {
      setDatePick(dayjs().toDate());
    }

    if (checkFuture === false) {
      setDatePick(
        dayjs()
          .set("month", monthPick)
          .set("year", yearPick)
          .endOf("month")
          .toDate()
      );
    }
  }, [monthPick, yearPick]);

  return (
    <StaticCard title="Masa Pelaporan Pajak">
      <form id="form-generator-period" className="flex gap-6">
        <div className="w-1/3">
          <label>Bulan</label>
          <select
            className="w-full"
            defaultValue={monthPick}
            ref={monthPickRef}
            onChange={(e) => onMonthChangeListener(e.target.selectedIndex)}
          >
            {months.map((month, index) => {
              return (
                <option key={index} value={index}>
                  {month}
                </option>
              );
            })}
          </select>
        </div>
        <div className="w-1/3">
          <label>Tahun</label>
          <select
            className="w-full"
            defaultValue={yearPick}
            onChange={(e) => onYearChangeListener(e.target.value)}
          >
            {getYears().map((year) => {
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        <div className="w-1/3">
          <label>Tanggal Faktur</label>
          <DatePicker
            className="w-full"
            selected={datePick}
            onChange={(date) => onDateChangeListener(date)}
            peekNextMonth
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </div>
      </form>
    </StaticCard>
  );
};

export default FormPeriod;

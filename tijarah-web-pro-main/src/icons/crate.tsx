import * as React from "react";
import { SVGProps } from "react";

const Crate = (props: any) => {
  console.log(props);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      width={25}
      height={25}
      viewBox="0 0 60 60"
      {...props}>
      <path
        d="M12 0H0v60h60V0H12zm34 12h2v36h-2V12zm-2 36h-8V12h8v36zm-10 0h-8V12h8v36zm-10 0h-8V12h8v36zm-10 0h-2V12h2v36zM2 2h8v46H9v-1a1 1 0 1 0-2 0v1H6v-7a1 1 0 1 0-2 0v7H2V2zm0 56v-8h46v2h-5a1 1 0 1 0 0 2h5v1h-3a1 1 0 1 0 0 2h3v1H2zm56 0h-8V12h2v5a1 1 0 1 0 2 0v-5h1v3a1 1 0 1 0 2 0v-3h1v46zM48 10H12V9h2a1 1 0 1 0 0-2h-2V6h3a1 1 0 1 0 0-2h-3V2h46v8H48z"
        fill={props.color}
      />
      <circle cx={55} cy={4} r={1} />
      <circle cx={51} cy={4} r={1} />
      <circle cx={55} cy={8} r={1} />
      <circle cx={51} cy={8} r={1} />
      <circle cx={56} cy={55} r={1} />
      <circle cx={56} cy={51} r={1} />
      <circle cx={52} cy={55} r={1} />
      <circle cx={52} cy={51} r={1} />
      <circle cx={5} cy={56} r={1} />
      <circle cx={9} cy={56} r={1} />
      <circle cx={5} cy={52} r={1} />
      <circle cx={9} cy={52} r={1} />
      <circle cx={4} cy={5} r={1} />
      <circle cx={4} cy={9} r={1} />
      <circle cx={8} cy={5} r={1} />
      <circle cx={8} cy={9} r={1} />
    </svg>
  );
};

export default Crate;

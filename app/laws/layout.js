import { notFound } from "next/navigation";

export default function Layout({ children, modal }) {
  return notFound();
  // TODO: remove this to show laws
  // return (
  //   <>
  //     {children}
  //     {modal}
  //   </>
  // );
}

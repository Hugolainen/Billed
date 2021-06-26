import { screen, fireEvent  } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { ROUTES } from "../constants/routes"

import { localStorageMock } from "../__mocks__/localStorage"
import firebase from '../__mocks__/firebase';
import Firestore from '../app/Firestore';

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"

const containerInit = () => {
  document.body.innerHTML = NewBillUI(); 
  const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
  
  return new NewBill({
    document,
    onNavigate,
    firestore: false,
    localStorage: window.localStorage,
  });
}

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I add a file in the Fee input", () => {
      test("Then only files with .png, .jpg and .jpeg should be accepted", () => {
        const container = containerInit();
        const errMessage = screen.getByTestId('fileInput-error-message');
        let testFile;

        const inputFile = screen.getByTestId('file');
        const handleChangeFile = jest.fn(container.handleChangeFile);
        inputFile.addEventListener('change', handleChangeFile);

        // png
        testFile = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
        fireEvent.change(inputFile, { target: { files: [testFile]} });
        userEvent.upload(inputFile, testFile);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0]).toStrictEqual(testFile);
        expect(errMessage.classList.length).toEqual(2);
        expect(errMessage.classList[1]).toEqual('fileInput-error-message--hide');

        // jpg
        testFile = new File(['(⌐□_□)'], 'test.jpg', { type: 'image/jpg' });
        fireEvent.change(inputFile, { target: { files: [testFile]} });
        userEvent.upload(inputFile, testFile);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0]).toStrictEqual(testFile);
        expect(errMessage.classList.length).toEqual(2);
        expect(errMessage.classList[1]).toEqual('fileInput-error-message--hide');

        // jpeg
        testFile = new File(['(⌐□_□)'], 'test.jpeg', { type: 'image/jpeg' });
        fireEvent.change(inputFile, { target: { files: [testFile]} });
        userEvent.upload(inputFile, testFile);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0]).toStrictEqual(testFile);
        expect(errMessage.classList.length).toEqual(2);
        expect(errMessage.classList[1]).toEqual('fileInput-error-message--hide');

        // error
        testFile = new File(['(⌐□_□)'], 'test.gif', { type: 'image/gif' });
        fireEvent.change(inputFile, { target: { files: [testFile]} });
        userEvent.upload(inputFile, testFile);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0]).toStrictEqual(testFile);
        expect(errMessage.classList.length).toEqual(1);
      })
    })

    describe("When I completed the form and click on submit button", () => {
      test("Then a new bill should be created and billsUI loaded", () => {

      })
    })
  })
})
/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

const FormDataMock = {
  append: jest.fn(),
  entries: jest.fn(),
};

jest.mock("../app/store", () => mockStore);

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "a@a",
    })
  );
  global.formData = jest.fn(() => {
    FormDataMock;
  });
});

// Init onNavigate
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({
    pathname,
  });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    it("Then mail icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon).toHaveClass("active-icon");
    });
    it("then the form should be submitted by clicking on the submit button", () => {
      const mockedFormEvent = {
        target: { querySelector: jest.fn() },
        preventDefault: jest.fn(),
      };
      mockedFormEvent.target.querySelector.mockReturnValue("valeur de test");

      const html = NewBillUI();
      document.body.innerHTML = html;

      const Newbills = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      const handleSubmit = jest.fn(() =>
        Newbills.handleSubmit(mockedFormEvent)
      );

      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);
      const buttonSubmit = screen.getByRole("button");
      userEvent.click(buttonSubmit);
      expect(handleSubmit).toHaveBeenCalled();
    });
    it("then the form should be submitted by clicking on the submit button", () => {});
  });
});

describe("Given I am on NewBill Page", () => {
  describe("When I Submit a new file", () => {
    it("then I have to see the error message if the file type is not valid", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const Newbills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => Newbills.handleChangeFile(e));
      const blob = new Blob(["text"], { type: "text/plain" });
      const file = new File([blob], "file.txt", { type: "text/plain" });
      const inputFile = screen.getByTestId("file");

      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [file],
        },
      });
      expect(handleChangeFile).toHaveBeenCalledTimes(1);
      expect(inputFile.files[0].type).not.toMatch(/^image\//);

      const MsgError = screen.getByTestId("file-error-msg");
      expect(MsgError).toHaveTextContent(
        "Seules les images au format JPG, JPEG ou PNG son accepté"
      );
    });
    it("then I don't see any error message if the file type is valid", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const Newbills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => Newbills.handleChangeFile(e));
      const blob = new Blob(["image"], { type: "image/jpg" });
      const file = new File([blob], "file.txt", { type: "image/jpg" });
      const inputFile = screen.getByTestId("file");

      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [file],
        },
      });
      expect(handleChangeFile).toHaveBeenCalledTimes(1);
      expect(inputFile.files[0].type).toMatch(/^image\//);

      const MsgError = screen.getByTestId("file-error-msg");
      expect(MsgError).not.toHaveTextContent(
        "Seules les images au format JPG, JPEG ou PNG son accepté"
      );
    });
  });
});

// test d'intégration POST

describe("Given I am connected as an employee", () => {
  describe("When I complete the required fields and submit the form", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
    });
    it("send bills from mock API POST", async () => {
      //create method
      const CreateBill = await mockStore.bills().create();
      expect(CreateBill.key).toBe("1234");

      //updat method
      const UpdateBill = await mockStore.bills().update();
      expect(UpdateBill.id).toBe("47qAXb6fIm2zOKkLzMro");
    });
<<<<<<< HEAD

    //cas d'erreur non prise en charge dans l' interface pour la partie new bill
    // describe("When an error occurs on API", () => {
    //   beforeEach(() => {
    //     const root = document.createElement("div");
    //     root.setAttribute("id", "root");
    //     document.body.appendChild(root);
    //     router();
    //   });
    //   it("send bills from mock API and fails with 404 message error", async () => {
    //     mockStore.bills.mockImplementationOnce(() => {
    //       return {
    //         list: () => {
    //           return Promise.reject(new Error("Erreur 404"));
    //         },
    //         update: () => {
    //           return Promise.reject(new Error("Erreur 404"));
    //         },
    //       };
    //     });
    //     window.onNavigate(ROUTES_PATH.Bills);
    //     await new Promise(process.nextTick);
    //     const message = await screen.getByTestId("error-message");
    //     expect(message).toHaveTextContent("404");
    //   });
    //   it("send bills from mock API and fails with 500 message error", async () => {
    //     mockStore.bills.mockImplementationOnce(() => {
    //       return {
    //         list: () => {
    //           return Promise.reject(new Error("Erreur 500"));
    //         },
    //         update: () => {
    //           return Promise.reject(new Error("Erreur 500"));
    //         },
    //       };
    //     });
    //     window.onNavigate(ROUTES_PATH.Bills);
    //     await new Promise(process.nextTick);
    //     const message = await screen.getByTestId("error-message");
    //     expect(message).toHaveTextContent("500");
    //   });
    // });
=======
>>>>>>> parent of 55c207b (code cleanup)
  });
});

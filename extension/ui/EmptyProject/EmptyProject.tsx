import "./emptyProject.css";
import "@kittl/ui/Icons/menu";
import "@kittl/ui/Icons/uploads";

export const EmptyProject = () => {
  return (
    <div class="empty-project">
      <h2>Welcome! Are you ready to create your Pixel Art?</h2>
      <p>
        Click on{" "}
        <span class="empty-project-icon">
          <kittl-icon-menu />
        </span>{" "}
        to create a new project
      </p>
      <p>
        Or click on{" "}
        <span class="empty-project-icon">
          <kittl-icon-uploads />
        </span>{" "}
        to import an image from canvas
      </p>
    </div>
  );
};

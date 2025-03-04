$(document).ready(function () {

  // Fetch and display categories
  function fetchCategories() {
    $.ajax({
      url: "/api-get-category/",
      type: "GET",
      success: function (categories) {
        let tbody = $("#table_sales tbody");
        tbody.empty();

        categories.forEach(category => {
          tbody.append(`
            <tr data-id="${category.id}" data-category="${category.category}">
              <td class="bg-white text-left py-1 text-black border-8 border-sky-300">${category.category}</td>
            </tr>
          `);
        });

        console.log("Categories loaded successfully:", categories);
      },
      error: function (xhr) {
        console.error("Error fetching categories:", xhr.responseText);
      }
    });
  }

  // Insert new category
  $("#btn_save_category").click(function () {
    let categoryName = $("#category").val().trim();

    if (!categoryName) {
      alert("Category name is required!");
      return;
    }

    $.ajax({
      url: "/api-insert-category/",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ category: categoryName }),
      success: function (response) {
        alert("Category inserted successfully!");
        $("#category").val(""); // Clear input
        fetchCategories();
      },
      error: function (xhr) {
        let errorResponse = xhr.responseJSON;
        if (errorResponse && errorResponse.detail) {
          alert(`Error: ${errorResponse.detail}`);
        } else {
          alert("An unexpected error occurred.");
        }
      }
    });
  });

  // Handle double-click on a category row to trigger edit
  $(document).on("dblclick", "#table_sales tbody tr", function () {
    let categoryId = $(this).attr("data-id");
    let categoryName = $(this).attr("data-category");

    $("#category").val(categoryName);

    // Remove old update button if it exists
    $("#btn_update_category").remove();

    // Add update button after save button
    $("#btn_save_category").after(`
      <button id="btn_update_category" class="btn btn-warning mt-2">Update Category</button>
    `);

    // Handle update logic
    $("#btn_update_category").click(function () {
      let updatedCategoryName = $("#category").val().trim();

      if (!updatedCategoryName) {
        alert("Category name is required!");
        return;
      }

      $.ajax({
        url: `/api-update-category/${categoryId}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({ category: updatedCategoryName }),
        success: function (response) {
          alert("Category updated successfully!");
          fetchCategories();
          $("#category").val("");
          $("#btn_update_category").remove();
        },
        error: function (xhr) {
          let errorResponse = xhr.responseJSON;
          if (errorResponse && errorResponse.detail) {
            alert(`Error: ${errorResponse.detail}`);
          } else {
            alert("An unexpected error occurred.");
          }
        }
      });
    });
  });

  // Initial fetch when page loads
  fetchCategories();
});

$(document).ready(function() {
    $('#search_category').on('keyup', function() {
        let searchValue = $(this).val().toLowerCase();

        $('#table_sales tbody tr').each(function() {
            let text = $(this).text().toLowerCase();

            if (text.includes(searchValue)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // Optional - Fetch data when the page loads (if needed)
    fetchCategories();
});

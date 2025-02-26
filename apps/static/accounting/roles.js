$(document).ready(function () {

  function fetchRoles() {
    $.ajax({
      url: "/api-get-role/",
      type: "GET",
      success: function (roles) {
        let tbody = $("#table_sales tbody");
        tbody.empty();

        roles.forEach(role => {
          let allowedRoles = role.allowed_access.join(", ");
          tbody.append(`
            <tr data-id="${role.id}" data-role="${role.role}" data-allowed='${JSON.stringify(role.allowed_access)}'>
              <td>${role.id}</td>
              <td>${role.role}</td>
              <td>${allowedRoles}</td>
            </tr>
          `);
        });

        console.log("Roles loaded successfully:", roles);
      },
      error: function (xhr) {
        console.error("Error fetching roles:", xhr.responseText);
      }
    });
  }

  $("#btn_save_branch").click(function () {
    let roleName = $("#role").val();
    let allowedAccess = [];

    $("input[type='checkbox']:checked").each(function () {
      allowedAccess.push($(this).next("label").text().trim());
    });

    if (!roleName) {
      alert("Role name is required!");
      return;
    }

    $.ajax({
      url: "/api-insert-roles/",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ role: roleName, allowed_access: allowedAccess }),
      success: function (response) {
        alert(response.message);
        fetchRoles();
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

  $(document).on("dblclick", "#table_sales tbody tr", function () {
    console.log("Double-click detected!");

    let roleId = $(this).attr("data-id");
    let roleName = $(this).attr("data-role");
    let allowedRoles = $(this).attr("data-allowed");

    allowedRoles = allowedRoles ? JSON.parse(allowedRoles) : [];

    console.log("Editing Role:", { roleId, roleName, allowedRoles });

    $("#role").val(roleName);
    $("input[type='checkbox']").prop("checked", false);

    allowedRoles.forEach(access => {
      $("input[type='checkbox']").each(function () {
        if ($(this).next("label").text().trim() === access) {
          $(this).prop("checked", true);
        }
      });
    });

    $("#btn_update_role").remove();
    $("#btn_save_branch").after(`<button id="btn_update_role" class="btn btn-warning">Update</button>`);

    $("#btn_update_role").click(function () {
      let updatedRoleName = $("#role").val();
      let updatedAllowedAccess = [];

      $("input[type='checkbox']:checked").each(function () {
        updatedAllowedAccess.push($(this).next("label").text().trim());
      });

      if (!updatedRoleName) {
        alert("Role name is required!");
        return;
      }

      $.ajax({
        url: `/api-update-role/${roleId}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({ role: updatedRoleName, allowed_access: updatedAllowedAccess }),
        success: function (response) {
          alert(response.message);
          fetchRoles();
          $("#btn_update_role").remove();
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

  fetchRoles();
});


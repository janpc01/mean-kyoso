import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-board-admin',
  templateUrl: './board-admin.component.html',
  styleUrls: ['./board-admin.component.css']
})
export class BoardAdminComponent implements OnInit {
  content?: string;

  constructor(private userService: UserService) { }

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.userService.getAdminBoard();
      this.content = data;
    } catch (err: any) {
      if (err.error) {
        this.content = JSON.parse(err.error).message;
      } else {
        this.content = "Error with status: " + err.status;
      }
    }
  }
}